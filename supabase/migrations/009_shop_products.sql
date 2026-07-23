-- 009: Shop products (jerseys, shorts, socks, boots) — editable from admin

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('jerseys', 'shorts', 'socks', 'boots')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read shop products" ON shop_products;
CREATE POLICY "Public read shop products" ON shop_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access shop products" ON shop_products;
CREATE POLICY "Admin full access shop products" ON shop_products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'content_admin')
  )
);

CREATE INDEX IF NOT EXISTS idx_shop_products_sort_order ON shop_products(sort_order);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category);

DROP TRIGGER IF EXISTS shop_products_updated_at ON shop_products;
CREATE TRIGGER shop_products_updated_at BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
