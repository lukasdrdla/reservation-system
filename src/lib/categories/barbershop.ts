import type { BarbershopData, BarbershopBookingData } from '@/lib/types';

export const barbershopDefaults: BarbershopData = {
  chairCount: 3,
  stylists: [],
};

export function getAvailableStylists(
  barbershopData: BarbershopData,
  bookedStylistIds: string[]
): Array<{ id: string; name: string; specialties: string[] }> {
  return barbershopData.stylists.filter(
    (stylist) => !bookedStylistIds.includes(stylist.id)
  );
}

export function validateBarbershopBooking(data: BarbershopBookingData): string[] {
  const errors: string[] = [];

  if (!data.serviceType || data.serviceType.trim() === '') {
    errors.push('Vyberte typ služby');
  }

  if (!data.stylistId || data.stylistId.trim() === '') {
    errors.push('Vyberte stylistu');
  }

  return errors;
}

export function getServiceTypes(): string[] {
  return [
    'Pánský střih',
    'Dámský střih',
    'Dětský střih',
    'Barva',
    'Melír',
    'Holení',
    'Styling',
  ];
}

export function getStylistSpecialties(): string[] {
  return ['Střihy', 'Barvy', 'Styling', 'Vousy', 'Svatební účesy'];
}
