-- 010: Shop product color & size customization options

ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sizes TEXT[] NOT NULL DEFAULT '{}';
