import type { TenantCategory, RestaurantData, WellnessData, BarbershopData, FitnessData } from '@/lib/types';

export function getCategoryLabel(category: TenantCategory): string {
  const labels: Record<TenantCategory, string> = {
    RESTAURANT: 'Restaurace',
    WELLNESS_SPA: 'Wellness & Spa',
    BARBERSHOP: 'Kadeřnictví/Barbershop',
    FITNESS_SPORT: 'Fitness/Sport',
  };
  return labels[category];
}

export function getCategoryIcon(category: TenantCategory): string {
  const icons: Record<TenantCategory, string> = {
    RESTAURANT: 'UtensilsCrossed',
    WELLNESS_SPA: 'Sparkles',
    BARBERSHOP: 'Scissors',
    FITNESS_SPORT: 'Dumbbell',
  };
  return icons[category];
}

export function getCategoryColor(category: TenantCategory): string {
  const colors: Record<TenantCategory, string> = {
    RESTAURANT: '#E63946',
    WELLNESS_SPA: '#06D6A0',
    BARBERSHOP: '#F72585',
    FITNESS_SPORT: '#F77F00',
  };
  return colors[category];
}

export function validateCategoryData(category: TenantCategory, data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  switch (category) {
    case 'RESTAURANT':
      return validateRestaurantData(data as RestaurantData);
    case 'WELLNESS_SPA':
      return validateWellnessData(data as WellnessData);
    case 'BARBERSHOP':
      return validateBarbershopData(data as BarbershopData);
    case 'FITNESS_SPORT':
      return validateFitnessData(data as FitnessData);
    default:
      return false;
  }
}

function validateRestaurantData(data: RestaurantData): boolean {
  return (
    typeof data.tableCount === 'number' &&
    data.tableCount > 0 &&
    typeof data.seatingCapacity === 'number' &&
    data.seatingCapacity > 0
  );
}

function validateWellnessData(data: WellnessData): boolean {
  return (
    typeof data.roomCount === 'number' &&
    data.roomCount > 0 &&
    Array.isArray(data.procedureTypes)
  );
}

function validateBarbershopData(data: BarbershopData): boolean {
  return (
    typeof data.chairCount === 'number' &&
    data.chairCount > 0 &&
    Array.isArray(data.stylists)
  );
}

function validateFitnessData(data: FitnessData): boolean {
  return Array.isArray(data.trainers) && Array.isArray(data.activityTypes);
}

export function getDefaultCategoryData(category: TenantCategory): object {
  switch (category) {
    case 'RESTAURANT':
      return { tableCount: 10, seatingCapacity: 40 };
    case 'WELLNESS_SPA':
      return { roomCount: 3, procedureTypes: ['Masáž', 'Sauna'] };
    case 'BARBERSHOP':
      return { chairCount: 3, stylists: [] };
    case 'FITNESS_SPORT':
      return { trainers: [], activityTypes: ['Osobní trénink', 'Skupinová lekce'] };
    default:
      return {};
  }
}
