import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { BookingFormData } from '@/lib/types';
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/email';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const status = searchParams.get('status');

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
        ...(dateTo && { date: { lte: new Date(dateTo) } }),
        ...(status && status !== 'all' && { status: status.toUpperCase() as any }),
      },
      include: {
        service: true,
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' },
      ],
    });

    // Konverze pro kompatibilitu s frontendem
    const convertedBookings = bookings.map((booking) => ({
      ...booking,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
      customer_phone: booking.customerPhone,
      start_time: booking.startTime,
      end_time: booking.endTime,
      tenant_id: booking.tenantId,
      service_id: booking.serviceId,
      created_at: booking.createdAt.toISOString(),
      status: booking.status.toLowerCase(),
      service: booking.service
        ? {
            ...booking.service,
            tenant_id: booking.service.tenantId,
            service_data: booking.service.serviceData,
            created_at: booking.service.createdAt.toISOString(),
          }
        : undefined,
    }));

    return NextResponse.json(convertedBookings);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenant_id, ...bookingData } = body as BookingFormData & { tenant_id: string };

  if (!tenant_id) {
    return NextResponse.json(
      { error: 'tenant_id je povinný' },
      { status: 400 }
    );
  }

  // Validace povinných polí
  const requiredFields = ['service_id', 'date', 'start_time', 'customer_name', 'customer_email', 'customer_phone'];
  for (const field of requiredFields) {
    if (!bookingData[field as keyof BookingFormData]) {
      return NextResponse.json(
        { error: `${field} je povinné pole` },
        { status: 400 }
      );
    }
  }

  try {
    // Načíst tenant pro email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenant_id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nenalezen' },
        { status: 404 }
      );
    }

    // Načíst službu (celá data pro email)
    const service = await prisma.service.findUnique({
      where: { id: bookingData.service_id },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Služba nenalezena' },
        { status: 404 }
      );
    }

    // Vypočítat koncový čas
    const endTime = calculateEndTime(bookingData.start_time, service.duration);

    // Kontrola dostupnosti termínu (double-check)
    const existingBookings = await prisma.booking.findMany({
      where: {
        tenantId: tenant_id,
        date: new Date(bookingData.date),
        status: { not: 'CANCELLED' },
        OR: [
          {
            AND: [
              { startTime: { lte: bookingData.start_time } },
              { endTime: { gt: bookingData.start_time } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { lte: bookingData.start_time } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Tento termín již není dostupný' },
        { status: 409 }
      );
    }

    // Vytvořit rezervaci
    const booking = await prisma.booking.create({
      data: {
        tenantId: tenant_id,
        serviceId: bookingData.service_id,
        customerName: bookingData.customer_name,
        customerEmail: bookingData.customer_email,
        customerPhone: bookingData.customer_phone,
        date: new Date(bookingData.date),
        startTime: bookingData.start_time,
        endTime: endTime,
        note: bookingData.note || null,
        status: 'CONFIRMED',
      },
    });

    // Odeslat emaily (async, nečekáme na výsledek)
    const emailData = {
      booking: {
        ...booking,
        customer_email: booking.customerEmail,
        customer_name: booking.customerName,
        customer_phone: booking.customerPhone,
        start_time: booking.startTime,
        end_time: booking.endTime,
      },
      service: {
        ...service,
        tenant_id: service.tenantId,
        service_id: service.id,
      },
      tenant: {
        ...tenant,
        logo_url: tenant.logoUrl,
        primary_color: tenant.primaryColor,
      },
    };

    // Potvrzení zákazníkovi
    sendBookingConfirmation(emailData).then((result) => {
      if (result.success) {
        console.log('Confirmation email sent to:', booking.customerEmail);
      } else {
        console.error('Failed to send confirmation email:', result.error);
      }
    });

    // Notifikace provozovateli
    sendBookingNotification(emailData).then((result) => {
      if (result.success) {
        console.log('Notification email sent to:', tenant.email);
      } else {
        console.error('Failed to send notification email:', result.error);
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Chyba při vytváření rezervace' },
      { status: 500 }
    );
  }
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
