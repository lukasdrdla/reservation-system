import { createClient } from '@/lib/supabase/server';
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

  const date = new Date(dateStr);
  const dayOfWeek = getDayOfWeek(date);

  const supabase = await createClient();

  // Načíst službu pro délku trvání
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration')
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) {
    return NextResponse.json(
      { error: 'Služba nenalezena' },
      { status: 404 }
    );
  }

  // Načíst pracovní hodiny pro daný den
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dayOfWeek)
    .single();

  // Načíst existující rezervace pro daný den
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('date', dateStr)
    .neq('status', 'cancelled');

  // Načíst blokované termíny
  const { data: blockedTimes } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('date', dateStr);

  // Vygenerovat dostupné sloty
  const slots = generateTimeSlots(
    workingHours || null,
    service.duration,
    bookings || [],
    blockedTimes || [],
    date
  );

  return NextResponse.json(slots);
}
