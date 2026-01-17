'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import type { Booking, Service } from '@/lib/types';
import { formatDate, formatTime, formatPrice, cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, MoreVertical, Eye } from 'lucide-react';

interface BookingsTableProps {
  bookings: (Booking & { service?: Service })[];
  onStatusChange?: (id: string, status: 'confirmed' | 'cancelled' | 'completed') => void;
  showActions?: boolean;
}

export function BookingsTable({ bookings, onStatusChange, showActions = true }: BookingsTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      confirmed: 'Potvrzeno',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno',
    };
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  if (bookings.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)]">Žádné rezervace k zobrazení</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--secondary)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Datum a čas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Zákazník</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Služba</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Status</th>
              {showActions && (
                <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-muted)]">Akce</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{formatDate(booking.date)}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{booking.customer_name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{booking.customer_email}</p>
                    <p className="text-sm text-[var(--text-muted)]">{booking.customer_phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{booking.service?.name || '-'}</p>
                    {booking.service && (
                      <p className="text-sm text-[var(--text-muted)]">{formatPrice(booking.service.price)}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(booking.status)}
                </td>
                {showActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === booking.id ? null : booking.id)}
                        className="p-2 rounded-lg hover:bg-[var(--secondary)]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === booking.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[var(--border)] z-20">
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => {
                                    onStatusChange?.(booking.id, 'completed');
                                    setOpenMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--secondary)] flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Označit jako dokončeno
                                </button>
                                <button
                                  onClick={() => {
                                    onStatusChange?.(booking.id, 'cancelled');
                                    setOpenMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--secondary)] flex items-center gap-2 text-red-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Zrušit rezervaci
                                </button>
                              </>
                            )}
                            {booking.status === 'cancelled' && (
                              <button
                                onClick={() => {
                                  onStatusChange?.(booking.id, 'confirmed');
                                  setOpenMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--secondary)] flex items-center gap-2"
                              >
                                <Clock className="w-4 h-4 text-blue-600" />
                                Obnovit rezervaci
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-[var(--foreground)]">{booking.customer_name}</p>
                <p className="text-sm text-[var(--text-muted)]">{booking.service?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(booking.status)}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">
                {formatDate(booking.date)} | {formatTime(booking.start_time)}
              </span>
              {booking.service && (
                <span className="font-medium">{formatPrice(booking.service.price)}</span>
              )}
            </div>
            {showActions && booking.status === 'confirmed' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange?.(booking.id, 'completed')}
                  className="flex-1"
                >
                  Dokončit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange?.(booking.id, 'cancelled')}
                  className="text-red-600"
                >
                  Zrušit
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
