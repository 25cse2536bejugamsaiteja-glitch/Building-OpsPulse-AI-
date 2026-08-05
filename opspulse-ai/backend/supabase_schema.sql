-- OpsPulse AI - Supabase PostgreSQL Schema Initialization

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'ops_manager',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock_level INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  target_stock INTEGER NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  rating NUMERIC(3, 2) NOT NULL,
  minimum_order_qty INTEGER NOT NULL
);

-- 4. Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  sku TEXT NOT NULL,
  item_name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_cost NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 5. Agent Telemetry Logs Table
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  step TEXT NOT NULL,
  status TEXT NOT NULL,
  thought TEXT,
  action TEXT,
  output TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and public access policy for demo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow public update on inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public select on suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public select on purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on purchase_orders" ON public.purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on agent_logs" ON public.agent_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on agent_logs" ON public.agent_logs FOR INSERT WITH CHECK (true);

-- Seed Initial Data
INSERT INTO public.suppliers (id, name, sku, contact_email, lead_time_days, unit_price, rating, minimum_order_qty)
VALUES 
  ('sup-1', 'Apex Electronics Logistics', 'SKU-102', 'orders@apexelectronics.com', 3, 45.00, 4.8, 50),
  ('sup-2', 'Global Tech Components Ltd', 'SKU-102', 'sales@globaltechcomp.com', 7, 41.50, 4.2, 100),
  ('sup-3', 'FastTrack Hardware Inc', 'SKU-104', 'supply@fasttrackhw.com', 2, 18.50, 4.9, 25),
  ('sup-4', 'Vanguard Industrial Supply', 'SKU-205', 'fulfillment@vanguardind.com', 5, 85.00, 4.6, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inventory (id, sku, name, category, stock_level, reorder_point, target_stock, unit_cost, status)
VALUES 
  ('inv-1', 'SKU-102', 'Wireless Ergonomic Keyboard', 'Peripherals', 14, 40, 150, 45.00, 'CRITICAL'),
  ('inv-2', 'SKU-104', 'USB-C Fast Charging Hub (7-in-1)', 'Accessories', 28, 50, 200, 18.50, 'LOW'),
  ('inv-3', 'SKU-205', 'Ultra-Wide 34" Monitor Arm', 'Furniture', 8, 15, 60, 85.00, 'CRITICAL'),
  ('inv-4', 'SKU-309', 'Noise-Canceling Bluetooth Headset', 'Audio', 110, 30, 120, 62.00, 'HEALTHY'),
  ('inv-5', 'SKU-412', 'Mechanical RGB Gaming Key switches (100pk)', 'Components', 95, 25, 100, 29.00, 'HEALTHY')
ON CONFLICT (id) DO NOTHING;
