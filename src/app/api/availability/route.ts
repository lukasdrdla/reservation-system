import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { generateTimeSlots, getDayOfWeek } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get('tenant_id');
  const dateStr = searchParams.get('date');
  const serviceId = searchParams.get('service_id');

  if (!tenantId || !dateStr || !serviceId) {
    return NextResponse.json(
      { error: 'tenant_id, date a service_id jsou povinné' },
      { status: 400 }
    );
  }

  try {
    const date = new Date(dateStr);
    const dayOfWeek = getDayOfWeek(date);

    // Načíst službu pro délku trvání
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Služba nenalezena' },
        { status: 404 }
      );
    }

    // Načíst pracovní hodiny pro daný den
    const workingHours = await prisma.workingHours.findUnique({
      where: {
        tenantId_dayOfWeek: {
          tenantId,
          dayOfWeek,
        },
      },
    });

    // Načíst existující rezervace pro daný den
    const bookings = await prisma.booking.findMany({
      where: {
        tenantId,
        date: new Date(dateStr),
        status: { not: 'CANCELLED' },
      },
    });

    // Načíst blokované termíny
    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        tenantId,
        date: new Date(dateStr),
      },
    });

    // Konverze pro kompatibilitu s generateTimeSlots
    const convertedWorkingHours = workingHours
      ? {
          start_time: workingHours.startTime,
          end_time: workingHours.endTime,
          is_working: workingHours.isWorking,
        }
      : null;

    const convertedBookings = bookings.map((b) => ({
      start_time: b.startTime,
      end_time: b.endTime,
    }));

    const convertedBlockedTimes = blockedTimes.map((bt) => ({
      start_time: bt.startTime,
      end_time: bt.endTime,
    }));

    // Vygenerovat dostupné sloty
    const slots = generateTimeSlots(
      convertedWorkingHours,
      service.duration,
      convertedBookings,
      convertedBlockedTimes,
      date
    );

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání dostupnosti' },
      { status: 500 }
    );
  }
}
