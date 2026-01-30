import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatsCards, BookingsTable } from '@/components/admin';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) redirect('/admin/login');

  const tenantId = session.user.tenantId;

  const today = new Date();
  const todayDate = new Date(format(today, 'yyyy-MM-dd'));
  const weekStart = new Date(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const weekEnd = new Date(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const monthStart = new Date(format(startOfMonth(today), 'yyyy-MM-dd'));
  const monthEnd = new Date(format(endOfMonth(today), 'yyyy-MM-dd'));

  // Načíst statistiky paralelně
  const [todayCount, weekCount, monthCount, completedCount] = await Promise.all([
    prisma.booking.count({
      where: {
        tenantId,
        date: todayDate,
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.booking.count({
      where: {
        tenantId,
        date: { gte: weekStart, lte: weekEnd },
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.booking.count({
      where: {
        tenantId,
        date: { gte: monthStart, lte: monthEnd },
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.booking.count({
      where: {
        tenantId,
        status: 'COMPLETED',
      },
    }),
  ]);

  // Načíst dnešní rezervace
  const todayBookingsList = await prisma.booking.findMany({
    where: {
      tenantId,
      date: todayDate,
      status: { not: 'CANCELLED' },
    },
    include: {
      service: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Konverze pro kompatibilitu s BookingsTable
  const convertedBookings = todayBookingsList.map((booking) => ({
    ...booking,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    customer_phone: booking.customerPhone,
    start_time: booking.startTime,
    end_time: booking.endTime,
    tenant_id: booking.tenantId,
    service_id: booking.serviceId,
    created_at: booking.createdAt.toISOString(),
    service: booking.service
      ? {
          ...booking.service,
          tenant_id: booking.service.tenantId,
          service_data: booking.service.serviceData,
          created_at: booking.service.createdAt.toISOString(),
        }
      : undefined,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--text-muted)]">Přehled vašich rezervací</p>
      </div>

      <StatsCards
        todayCount={todayCount}
        weekCount={weekCount}
        monthCount={monthCount}
        completedCount={completedCount}
      />

      <Card padding="none">
        <CardHeader className="p-6 pb-0">
          <CardTitle>Dnešní rezervace</CardTitle>
        </CardHeader>
        <div className="p-6 pt-4">
          <BookingsTable bookings={convertedBookings} showActions={false} />
        </div>
      </Card>
    </div>
  );
}
