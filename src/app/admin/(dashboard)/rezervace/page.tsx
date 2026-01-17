'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingsTable } from '@/components/admin';
import { Card, Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { Booking, Service, Tenant } from '@/lib/types';
import { Search, Filter, Loader2 } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';

type StatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled';

export default function ReservationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<(Booking & { service?: Service })[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Získat tenant
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!tenantData) {
      setLoading(false);
      return;
    }

    setTenant(tenantData);

    // Načíst rezervace
    let query = supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('tenant_id', tenantData.id)
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: bookingsData } = await query;
    setBookings(bookingsData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, dateFrom, dateTo]);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    const supabase = createClient();
    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    loadData();
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.customer_name.toLowerCase().includes(query) ||
      booking.customer_email.toLowerCase().includes(query) ||
      booking.customer_phone.includes(query) ||
      booking.service?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Rezervace</h1>
        <p className="text-[var(--text-muted)]">Správa všech rezervací</p>
      </div>

      {/* Filtry */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Hledání */}
          <div className="flex-1">
            <Input
              placeholder="Hledat zákazníka..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filtr */}
          <div className="flex gap-2">
            {(['all', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' && 'Vše'}
                {status === 'confirmed' && 'Potvrzené'}
                {status === 'completed' && 'Dokončené'}
                {status === 'cancelled' && 'Zrušené'}
              </Button>
            ))}
          </div>

          {/* Datum filtry */}
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
            />
            <span className="text-[var(--text-muted)]">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Tabulka */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : (
        <BookingsTable
          bookings={filteredBookings}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Počet výsledků */}
      {!loading && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          Zobrazeno {filteredBookings.length} rezervací
        </p>
      )}
    </div>
  );
}
