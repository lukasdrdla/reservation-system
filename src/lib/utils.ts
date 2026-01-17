import { format, parse, addMinutes, isBefore, isAfter, startOfDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import type { WorkingHours, Booking, BlockedTime, TimeSlot } from './types';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd. MMMM yyyy', { locale: cs });
}

export function formatTime(time: string): string {
  return time.slice(0, 5); // "09:00:00" -> "09:00"
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
  }).format(price);
}

export function getDayOfWeek(date: Date): number {
  return date.getDay(); // 0 = neděle, 1 = pondělí...
}

export function generateTimeSlots(
  workingHours: WorkingHours | null,
  serviceDuration: number,
  existingBookings: Booking[],
  blockedTimes: BlockedTime[],
  date: Date
): TimeSlot[] {
  if (!workingHours || !workingHours.is_working) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const dateStr = format(date, 'yyyy-MM-dd');

  // Parsovat pracovní hodiny (ořezat sekundy pokud jsou přítomny)
  const startTimeStr = workingHours.start_time.slice(0, 5);
  const endTimeStr = workingHours.end_time.slice(0, 5);
  const startTime = parse(startTimeStr, 'HH:mm', startOfDay(date));
  const endTime = parse(endTimeStr, 'HH:mm', startOfDay(date));

  let currentSlot = startTime;

  while (isBefore(addMinutes(currentSlot, serviceDuration), endTime) ||
         format(addMinutes(currentSlot, serviceDuration), 'HH:mm') === format(endTime, 'HH:mm')) {
    const slotTime = format(currentSlot, 'HH:mm');
    const slotEnd = format(addMinutes(currentSlot, serviceDuration), 'HH:mm');

    // Kontrola kolize s existujícími rezervacemi
    const hasBookingConflict = existingBookings.some((booking) => {
      if (booking.date !== dateStr) return false;
      const bookingStart = booking.start_time.slice(0, 5);
      const bookingEnd = booking.end_time.slice(0, 5);
      return (
        (slotTime >= bookingStart && slotTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    // Kontrola blokovaných termínů
    const isBlocked = blockedTimes.some((blocked) => {
      if (blocked.date !== dateStr) return false;
      if (!blocked.start_time || !blocked.end_time) return true; // Celý den blokován
      const blockedStart = blocked.start_time.slice(0, 5);
      const blockedEnd = blocked.end_time.slice(0, 5);
      return (
        (slotTime >= blockedStart && slotTime < blockedEnd) ||
        (slotEnd > blockedStart && slotEnd <= blockedEnd) ||
        (slotTime <= blockedStart && slotEnd >= blockedEnd)
      );
    });

    slots.push({
      time: slotTime,
      available: !hasBookingConflict && !isBlocked,
    });

    currentSlot = addMinutes(currentSlot, 30); // Sloty po 30 minutách
  }

  return slots;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
