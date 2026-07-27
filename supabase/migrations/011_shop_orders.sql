-- 011: Shop orders from cart checkout

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access shop orders" ON shop_orders;
CREATE POLICY "Admin full access shop orders" ON shop_orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'content_admin')
  )
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created ON shop_orders(created_at DESC);

DROP TRIGGER IF EXISTS shop_orders_updated_at ON shop_orders;
CREATE TRIGGER shop_orders_updated_at BEFORE UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
