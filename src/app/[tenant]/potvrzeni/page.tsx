'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import type { Tenant, Booking, Service } from '@/lib/types';
import { formatDate, formatTime, formatPrice } from '@/lib/utils';
import { CheckCircle2, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.tenant as string;
  const bookingId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [booking, setBooking] = useState<(Booking & { service: Service }) | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        // Načíst tenant
        const tenantRes = await fetch(`/api/tenant/${slug}`);
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setTenant(tenantData);
        }

        // Načíst rezervaci - for now we'll show a generic confirmation
        // In production, you'd fetch the booking details
        // For MVP, we show confirmation without fetching (the data was just submitted)
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Apply tenant's primary color
  const customStyle = tenant?.primary_color
    ? { '--primary': tenant.primary_color } as React.CSSProperties
    : {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" style={customStyle}>
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[var(--success)]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Rezervace potvrzena!
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            Potvrzení jsme vám odeslali na email.
          </p>

          {/* Info box */}
          <div className="bg-[var(--secondary)] rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
              <span>Vaše rezervace byla úspěšně vytvořena</span>
            </div>
            {tenant && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[var(--text-muted)]" />
                <span>{tenant.name}</span>
              </div>
            )}
          </div>

          {/* What's next */}
          <div className="text-left mb-6">
            <h3 className="font-semibold mb-2">Co bude následovat?</h3>
            <ul className="text-sm text-[var(--text-muted)] space-y-2">
              <li>• Na váš email jsme poslali potvrzení s detaily rezervace</li>
              <li>• Den před termínem vám pošleme připomínku</li>
              <li>• Potřebujete změnit termín? Kontaktujte nás</li>
            </ul>
          </div>

          {/* Contact info */}
          {tenant && (
            <div className="border-t border-[var(--border)] pt-4 mb-6">
              <p className="text-sm text-[var(--text-muted)]">
                Kontakt: <a href={`mailto:${tenant.email}`} className="text-[var(--primary)] hover:underline">{tenant.email}</a>
                {tenant.phone && (
                  <> | <a href={`tel:${tenant.phone}`} className="text-[var(--primary)] hover:underline">{tenant.phone}</a></>
                )}
              </p>
            </div>
          )}

          {/* Back button */}
          <Link href={`/${slug}`}>
            <Button variant="outline" className="w-full">
              Vytvořit další rezervaci
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
