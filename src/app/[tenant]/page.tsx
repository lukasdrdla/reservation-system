'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, Calendar, TimeSlots, Button } from '@/components/ui';
import { BookingForm } from '@/components/forms/BookingForm';
import type { Tenant, Service, TimeSlot, BookingFormData } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Loader2, Clock, Banknote, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

type Step = 'service' | 'datetime' | 'form';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.tenant as string;

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking state
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Načíst tenant a služby
  useEffect(() => {
    async function loadData() {
      try {
        // Načíst tenant
        const tenantRes = await fetch(`/api/tenant/${slug}`);
        if (!tenantRes.ok) {
          router.push('/');
          return;
        }
        const tenantData = await tenantRes.json();
        setTenant(tenantData);

        // Načíst služby
        const servicesRes = await fetch(`/api/services?tenant_id=${tenantData.id}`);
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, router]);

  // Načíst dostupné sloty při změně data
  useEffect(() => {
    async function loadSlots() {
      if (!tenant || !selectedService || !selectedDate) {
        setSlots([]);
        return;
      }

      setSlotsLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await fetch(
          `/api/availability?tenant_id=${tenant.id}&date=${dateStr}&service_id=${selectedService.id}`
        );
        const data = await res.json();
        setSlots(data);
      } catch (error) {
        console.error('Error loading slots:', error);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [tenant, selectedService, selectedDate]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('datetime');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleBookingSubmit = async (data: BookingFormData) => {
    if (!tenant) return;

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, tenant_id: tenant.id }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Chyba při vytváření rezervace');
    }

    const booking = await res.json();
    router.push(`/${slug}/potvrzeni?id=${booking.id}`);
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('datetime');
      setSelectedTime(null);
    } else if (step === 'datetime') {
      setStep('service');
      setSelectedService(null);
      setSelectedDate(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Stránka nenalezena</p>
      </div>
    );
  }

  // Apply tenant's primary color
  const customStyle = tenant.primary_color
    ? { '--primary': tenant.primary_color, '--primary-hover': adjustColor(tenant.primary_color, -20) } as React.CSSProperties
    : {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" style={customStyle}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {tenant.logo_url && (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="h-16 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{tenant.name}</h1>
          <p className="text-[var(--text-muted)]">Online rezervace</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <StepIndicator number={1} label="Služba" active={step === 'service'} completed={step !== 'service'} />
          <div className="w-8 h-0.5 bg-[var(--border)]" />
          <StepIndicator number={2} label="Termín" active={step === 'datetime'} completed={step === 'form'} />
          <div className="w-8 h-0.5 bg-[var(--border)]" />
          <StepIndicator number={3} label="Údaje" active={step === 'form'} completed={false} />
        </div>

        {/* Content */}
        <Card>
          {step === 'service' && (
            <div className="space-y-4">
              <CardHeader>
                <CardTitle>Vyberte službu</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--secondary)] transition-all text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-[var(--text-muted)] mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[var(--text-muted)]">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{service.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--foreground)] font-medium mt-1">
                          <Banknote className="w-4 h-4" />
                          <span>{formatPrice(service.price)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {services.length === 0 && (
                  <p className="text-center text-[var(--text-muted)] py-8">
                    Žádné služby nejsou k dispozici
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'datetime' && selectedService && (
            <div className="space-y-6">
              <CardHeader>
                <CardTitle>Vyberte termín</CardTitle>
                <p className="text-sm text-[var(--text-muted)]">
                  {selectedService.name} ({selectedService.duration} min)
                </p>
              </CardHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Datum</h4>
                  <Calendar
                    selected={selectedDate || undefined}
                    onSelect={handleDateSelect}
                    minDate={new Date()}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Čas</h4>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                    </div>
                  ) : (
                    <TimeSlots
                      slots={slots}
                      selected={selectedTime || undefined}
                      onSelect={handleTimeSelect}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-start">
                <Button variant="ghost" onClick={handleBack}>
                  Zpět na výběr služby
                </Button>
              </div>
            </div>
          )}

          {step === 'form' && selectedService && selectedDate && selectedTime && tenant && (
            <div className="space-y-6">
              <CardHeader>
                <CardTitle>Vaše údaje</CardTitle>
              </CardHeader>
              <BookingForm
                service={selectedService}
                date={selectedDate}
                time={selectedTime}
                tenantId={tenant.id}
                onSubmit={handleBookingSubmit}
                onBack={handleBack}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          active
            ? 'bg-[var(--primary)] text-white'
            : completed
            ? 'bg-[var(--success)] text-white'
            : 'bg-[var(--secondary)] text-[var(--text-muted)]'
        }`}
      >
        {completed ? <CheckCircle2 className="w-5 h-5" /> : number}
      </div>
      <span
        className={`text-sm ${
          active ? 'font-medium text-[var(--foreground)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function adjustColor(color: string, amount: number): string {
  // Simple color adjustment for hover state
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
