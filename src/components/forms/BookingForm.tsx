'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';
import type {
  BookingFormData,
  Service,
  Tenant,
  RestaurantData,
  WellnessData,
  BarbershopData,
  FitnessData,
  RestaurantBookingData,
  WellnessBookingData,
  BarbershopBookingData,
  FitnessBookingData,
} from '@/lib/types';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';
import {
  RestaurantBooking,
  WellnessBooking,
  BarbershopBooking,
  FitnessBooking,
} from '@/components/booking';

interface BookingFormProps {
  service: Service;
  date: Date;
  time: string;
  tenant: Tenant;
  selectedSpecialist?: { id: string; name: string } | null;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onBack: () => void;
}

export function BookingForm({
  service,
  date,
  time,
  tenant,
  selectedSpecialist,
  onSubmit,
  onBack,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    note: '',
  });
  const [categoryData, setCategoryData] = useState<
    | RestaurantBookingData
    | WellnessBookingData
    | BarbershopBookingData
    | FitnessBookingData
    | null
  >(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Zadejte vaše jméno';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Zadejte váš email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Zadejte platný email';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Zadejte váš telefon';
    } else if (!/^[0-9\s+()-]{9,}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Zadejte platné telefonní číslo';
    }

    // Validate category-specific data
    if (!categoryData) {
      newErrors.category_data = 'Vyplňte všechna povinná pole';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        service_id: service.id,
        date: date.toISOString().split('T')[0],
        start_time: time,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        note: formData.note || undefined,
        booking_data: categoryData || undefined,
      });
    } catch {
      setErrors({ form: 'Nastala chyba při vytváření rezervace. Zkuste to prosím znovu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shrnutí rezervace */}
      <div className="bg-[var(--secondary)] rounded-xl p-4 space-y-2">
        <h3 className="font-semibold">{service.name}</h3>
        <div className="text-sm text-[var(--text-muted)] space-y-1">
          <p>{formatDate(date)}</p>
          <p>{formatTime(time)} - {formatTime(calculateEndTime(time, service.duration))}</p>
          <p className="font-medium text-[var(--foreground)]">{formatPrice(service.price)}</p>
        </div>
      </div>

      {/* Formulář */}
      <div className="space-y-4">
        <Input
          id="customer_name"
          label="Jméno a příjmení"
          placeholder="Jan Novák"
          icon={User}
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          error={errors.customer_name}
          required
        />

        <Input
          id="customer_email"
          type="email"
          label="Email"
          placeholder="jan@email.cz"
          icon={Mail}
          value={formData.customer_email}
          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
          error={errors.customer_email}
          required
        />

        <Input
          id="customer_phone"
          type="tel"
          label="Telefon"
          placeholder="+420 777 123 456"
          icon={Phone}
          value={formData.customer_phone}
          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
          error={errors.customer_phone}
          required
        />

        {/* Category-specific booking fields */}
        {tenant.category === 'RESTAURANT' && (
          <RestaurantBooking
            restaurantData={(tenant.category_data as RestaurantData) || { tableCount: 10, seatingCapacity: 40 }}
            selectedDate={date}
            selectedTime={time}
            onDataChange={setCategoryData}
          />
        )}

        {tenant.category === 'WELLNESS_SPA' && (
          <WellnessBooking
            wellnessData={(tenant.category_data as WellnessData) || { roomCount: 3, procedureTypes: ['Masáž', 'Sauna'] }}
            selectedDate={date}
            selectedTime={time}
            selectedTherapist={selectedSpecialist}
            onDataChange={setCategoryData}
          />
        )}

        {tenant.category === 'BARBERSHOP' && (
          <BarbershopBooking
            barbershopData={(tenant.category_data as BarbershopData) || { chairCount: 3, stylists: [] }}
            selectedDate={date}
            selectedTime={time}
            selectedStylist={selectedSpecialist}
            onDataChange={setCategoryData}
          />
        )}

        {tenant.category === 'FITNESS_SPORT' && (
          <FitnessBooking
            fitnessData={(tenant.category_data as FitnessData) || { trainers: [], activityTypes: ['Osobní trénink', 'Skupinová lekce'] }}
            selectedDate={date}
            selectedTime={time}
            selectedTrainer={selectedSpecialist}
            onDataChange={setCategoryData}
          />
        )}

        {errors.category_data && (
          <p className="text-sm text-[var(--error)]">{errors.category_data}</p>
        )}

        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Poznámka (nepovinné)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MessageSquare className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <textarea
              id="note"
              rows={3}
              placeholder="Doplňující informace..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent placeholder:text-[var(--text-muted)] transition-all resize-none"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
        </div>
      </div>

      {errors.form && (
        <p className="text-sm text-[var(--error)] text-center">{errors.form}</p>
      )}

      {/* Akce */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Zpět
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Potvrdit rezervaci
        </Button>
      </div>
    </form>
  );
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
