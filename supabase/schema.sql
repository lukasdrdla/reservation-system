-- DevStudio Rezervační Systém - Databázové schéma
-- Spusťte tento SQL v Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants (klienti systému)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#0066FF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services (služby)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL, -- v minutách
  price INTEGER NOT NULL, -- v Kč
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working hours (pracovní hodiny)
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=neděle
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT true,
  UNIQUE(tenant_id, day_of_week)
);

-- Bookings (rezervace)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked times (blokované termíny)
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME, -- NULL = celý den
  end_time TIME,
  reason VARCHAR(255)
);

-- Indexy pro lepší výkon
CREATE INDEX idx_services_tenant ON services(tenant_id);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_working_hours_tenant ON working_hours(tenant_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_blocked_times_tenant ON blocked_times(tenant_id);
CREATE INDEX idx_blocked_times_date ON blocked_times(date);

-- Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;

-- Veřejné čtení pro tenant info (pro rezervační stránku)
CREATE POLICY "Tenants are viewable by everyone" ON tenants
  FOR SELECT USING (true);

-- Veřejné čtení služeb
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

-- Veřejné čtení pracovních hodin
CREATE POLICY "Working hours are viewable by everyone" ON working_hours
  FOR SELECT USING (true);

-- Veřejné čtení rezervací (pro kontrolu dostupnosti)
CREATE POLICY "Bookings are viewable by everyone" ON bookings
  FOR SELECT USING (true);

-- Veřejné vytváření rezervací
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Veřejné čtení blokovaných termínů
CREATE POLICY "Blocked times are viewable by everyone" ON blocked_times
  FOR SELECT USING (true);

-- ===========================================
-- TESTOVACÍ DATA (volitelné)
-- ===========================================

-- Vytvořit testovacího tenanta
INSERT INTO tenants (slug, name, email, phone, primary_color) VALUES
  ('pavel-masaze', 'Pavel Masáže', 'pavel@masaze.cz', '+420 777 123 456', '#0066FF');

-- Získat ID tenanta
DO $$
DECLARE
  tenant_uuid UUID;
BEGIN
  SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'pavel-masaze';

  -- Přidat služby
  INSERT INTO services (tenant_id, name, duration, price, description) VALUES
    (tenant_uuid, 'Klasická masáž', 60, 800, 'Relaxační masáž celého těla'),
    (tenant_uuid, 'Sportovní masáž', 45, 700, 'Masáž pro sportovce, zaměřená na svalové partie'),
    (tenant_uuid, 'Relaxační masáž', 90, 1200, 'Hloubková relaxace s aromaterapií');

  -- Přidat pracovní hodiny (Po-Pá 9:00-17:00)
  INSERT INTO working_hours (tenant_id, day_of_week, start_time, end_time, is_working) VALUES
    (tenant_uuid, 1, '09:00', '17:00', true), -- Pondělí
    (tenant_uuid, 2, '09:00', '17:00', true), -- Úterý
    (tenant_uuid, 3, '09:00', '17:00', true), -- Středa
    (tenant_uuid, 4, '09:00', '17:00', true), -- Čtvrtek
    (tenant_uuid, 5, '09:00', '17:00', true), -- Pátek
    (tenant_uuid, 6, '10:00', '14:00', true), -- Sobota
    (tenant_uuid, 0, '00:00', '00:00', false); -- Neděle - zavřeno
END $$;
