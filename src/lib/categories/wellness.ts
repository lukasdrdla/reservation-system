import type { WellnessData, WellnessBookingData } from '@/lib/types';

export const wellnessDefaults: WellnessData = {
  roomCount: 3,
  procedureTypes: ['Masáž', 'Sauna', 'Baňkování', 'Reflexní terapie'],
  therapists: [],
};

export function getAvailableRooms(
  wellnessData: WellnessData,
  bookedRooms: string[]
): string[] {
  const allRooms = Array.from({ length: wellnessData.roomCount }, (_, i) => `${i + 1}`);
  return allRooms.filter((room) => !bookedRooms.includes(room));
}

export function validateWellnessBooking(data: WellnessBookingData): string[] {
  const errors: string[] = [];

  if (!data.procedureType || data.procedureType.trim() === '') {
    errors.push('Vyberte typ procedury');
  }

  if (!data.roomNumber || data.roomNumber.trim() === '') {
    errors.push('Vyberte místnost');
  }

  return errors;
}

export function getProcedureDuration(procedureType: string): number {
  const durations: Record<string, number> = {
    'Masáž': 60,
    'Sauna': 45,
    'Baňkování': 30,
    'Reflexní terapie': 50,
  };
  return durations[procedureType] || 60;
}
