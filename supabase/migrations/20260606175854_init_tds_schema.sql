-- Extensions

-- Videos (portfolio items)
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing tiers
CREATE TABLE price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC,
  features JSONB NOT NULL DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers from your original code
INSERT INTO price_tiers (name, min_price, max_price, features, is_featured, display_order) VALUES
  ('Basic', 150, 350, '["1 Concept","1 Hook","Simple Edit","2 Minor Revisions"]', false, 1),
  ('Standard', 350, 800, '["Strong Script","Polished Edit","Captions & Sound","2-3 Revisions"]', true, 2),
  ('Premium', 800, 2000, '["Ad Strategy","Master Edit","Scene Setups","Campaign Ready"]', false, 3);

-- Clients (optional: if you want to track returning clients)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (created by admin)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  tier_id UUID REFERENCES price_tiers(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, paid, cancelled
  invoice_number TEXT UNIQUE NOT NULL,
  payment_reference TEXT,
  payment_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (simple admin flag)
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client'))
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policies for public read (videos and tiers)
CREATE POLICY "Public can view videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Public can view active tiers"
  ON price_tiers FOR SELECT
  USING (true);

-- Admin-only policies (we'll set them more precisely later)
CREATE POLICY "Admins can manage videos"
  ON videos FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Admins can manage tiers"
  ON price_tiers FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));