export interface Tenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  primary_color: string;
  category: TenantCategory;
  category_data: RestaurantData | WellnessData | BarbershopData | FitnessData | null;
  created_at: string;
}

// Forward declaration for TenantCategory (defined below)
export type TenantCategory = 'RESTAURANT' | 'WELLNESS_SPA' | 'BARBERSHOP' | 'FITNESS_SPORT';

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  duration: number; // v minutách
  price: number; // v Kč
  description: string | null;
  active: boolean;
  created_at: string;
}

export interface WorkingHours {
  id: string;
  tenant_id: string;
  day_of_week: number; // 0=neděle, 1=pondělí...
  start_time: string; // "09:00"
  end_time: string; // "17:00"
  is_working: boolean;
}

export interface Booking {
  id: string;
  tenant_id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string; // "2025-01-15"
  start_time: string; // "14:00"
  end_time: string; // "15:00"
  status: 'confirmed' | 'cancelled' | 'completed';
  note: string | null;
  created_at: string;
  // Joined data
  service?: Service;
}

export interface BlockedTime {
  id: string;
  tenant_id: string;
  date: string;
  start_time: string | null; // NULL = celý den
  end_time: string | null;
  reason: string | null;
}

export interface TimeSlot {
  time: string; // "09:00"
  available: boolean;
}

export interface BookingFormData {
  service_id: string;
  date: string;
  start_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  note?: string;
  booking_data?: RestaurantBookingData | WellnessBookingData | BarbershopBookingData | FitnessBookingData;
}

// ==================== CATEGORY TYPES ====================

// Category-specific data for Tenant
export interface RestaurantData {
  tableCount: number;
  seatingCapacity: number;
  cuisineType?: string;
}

export interface WellnessData {
  roomCount: number;
  procedureTypes: string[];
  therapists?: Array<{ id: string; name: string }>;
}

export interface BarbershopData {
  chairCount: number;
  stylists: Array<{ id: string; name: string; specialties: string[] }>;
}

export interface FitnessData {
  trainers: Array<{ id: string; name: string; specialties: string[] }>;
  activityTypes: string[];
  groupSizeLimit?: number;
}

// Category-specific data for Booking
export interface RestaurantBookingData {
  tableNumber: number;
  personCount: number;
  specialRequests?: string;
}

export interface WellnessBookingData {
  procedureType: string;
  roomNumber: string;
  therapistName?: string;
}

export interface BarbershopBookingData {
  stylistId: string;
  stylistName: string;
  serviceType: string;
}

export interface FitnessBookingData {
  trainerId: string;
  trainerName: string;
  activityType: string;
  participantCount?: number;
}

// Helper type for category data
export type CategoryData<T extends TenantCategory> =
  T extends 'RESTAURANT' ? RestaurantData :
  T extends 'WELLNESS_SPA' ? WellnessData :
  T extends 'BARBERSHOP' ? BarbershopData :
  T extends 'FITNESS_SPORT' ? FitnessData :
  never;

export type BookingCategoryData<T extends TenantCategory> =
  T extends 'RESTAURANT' ? RestaurantBookingData :
  T extends 'WELLNESS_SPA' ? WellnessBookingData :
  T extends 'BARBERSHOP' ? BarbershopBookingData :
  T extends 'FITNESS_SPORT' ? FitnessBookingData :
  never;
