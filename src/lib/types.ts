export interface Tenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
}

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
}
