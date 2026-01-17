import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { BookingFormData } from '@/lib/types';
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/email';

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

  const supabase = await createClient();

  // Načíst tenant pro email
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenant_id)
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json(
      { error: 'Tenant nenalezen' },
      { status: 404 }
    );
  }

  // Načíst službu (celá data pro email)
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', bookingData.service_id)
    .single();

  if (serviceError || !service) {
    return NextResponse.json(
      { error: 'Služba nenalezena' },
      { status: 404 }
    );
  }

  // Vypočítat koncový čas
  const endTime = calculateEndTime(bookingData.start_time, service.duration);

  // Kontrola dostupnosti termínu (double-check)
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('tenant_id', tenant_id)
    .eq('date', bookingData.date)
    .neq('status', 'cancelled')
    .or(`and(start_time.lte.${bookingData.start_time},end_time.gt.${bookingData.start_time}),and(start_time.lt.${endTime},end_time.gte.${endTime})`);

  if (existingBookings && existingBookings.length > 0) {
    return NextResponse.json(
      { error: 'Tento termín již není dostupný' },
      { status: 409 }
    );
  }

  // Vytvořit rezervaci
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      tenant_id,
      service_id: bookingData.service_id,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email,
      customer_phone: bookingData.customer_phone,
      date: bookingData.date,
      start_time: bookingData.start_time,
      end_time: endTime,
      note: bookingData.note || null,
      status: 'confirmed',
    })
    .select()
    .single();

  if (bookingError) {
    console.error('Booking error:', bookingError);
    return NextResponse.json(
      { error: 'Chyba při vytváření rezervace' },
      { status: 500 }
    );
  }

  // Odeslat emaily (async, nečekáme na výsledek)
  const emailData = { booking, service, tenant };

  // Potvrzení zákazníkovi
  sendBookingConfirmation(emailData).then((result) => {
    if (result.success) {
      console.log('Confirmation email sent to:', booking.customer_email);
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
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
