import type { RestaurantData, RestaurantBookingData } from '@/lib/types';

export const restaurantDefaults: RestaurantData = {
  tableCount: 10,
  seatingCapacity: 40,
  cuisineType: 'Česká kuchyně',
};

export function getAvailableTables(
  restaurantData: RestaurantData,
  bookedTables: number[]
): number[] {
  const allTables = Array.from({ length: restaurantData.tableCount }, (_, i) => i + 1);
  return allTables.filter((table) => !bookedTables.includes(table));
}

export function validateRestaurantBooking(data: RestaurantBookingData): string[] {
  const errors: string[] = [];

  if (!data.personCount || data.personCount < 1) {
    errors.push('Počet osob musí být alespoň 1');
  }

  if (!data.tableNumber) {
    errors.push('Vyberte stůl');
  }

  return errors;
}

export function getTableCapacityRecommendation(personCount: number): string {
  if (personCount <= 2) return 'Doporučujeme stůl pro 2 osoby';
  if (personCount <= 4) return 'Doporučujeme stůl pro 4 osoby';
  if (personCount <= 6) return 'Doporučujeme stůl pro 6 osob';
  return 'Doporučujeme větší stůl nebo spojení stolů';
}
