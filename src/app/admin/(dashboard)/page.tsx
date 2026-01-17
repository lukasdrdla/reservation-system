import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatsCards, BookingsTable } from '@/components/admin';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Získat tenant ID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">Tenant nenalezen. Kontaktujte administrátora.</p>
      </div>
    );
  }

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  // Načíst statistiky
  const [todayBookings, weekBookings, monthBookings, completedBookings] = await Promise.all([
    supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .eq('date', todayStr)
      .neq('status', 'cancelled'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .neq('status', 'cancelled'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .neq('status', 'cancelled'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .eq('status', 'completed'),
  ]);

  // Načíst dnešní rezervace
  const { data: todayBookingsList } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .eq('tenant_id', tenant.id)
    .eq('date', todayStr)
    .neq('status', 'cancelled')
    .order('start_time');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--text-muted)]">Přehled vašich rezervací</p>
      </div>

      <StatsCards
        todayCount={todayBookings.count || 0}
        weekCount={weekBookings.count || 0}
        monthCount={monthBookings.count || 0}
        completedCount={completedBookings.count || 0}
      />

      <Card padding="none">
        <CardHeader className="p-6 pb-0">
          <CardTitle>Dnešní rezervace</CardTitle>
        </CardHeader>
        <div className="p-6 pt-4">
          <BookingsTable
            bookings={todayBookingsList || []}
            showActions={false}
          />
        </div>
      </Card>
    </div>
  );
}
