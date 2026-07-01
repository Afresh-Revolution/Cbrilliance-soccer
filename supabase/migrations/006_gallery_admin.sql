-- 006: Gallery admin access, timestamps, and indexes (idempotent)

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP POLICY IF EXISTS "Admin full access gallery" ON gallery_items;
CREATE POLICY "Admin full access gallery" ON gallery_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'content_admin')
  )
);

CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_items(category);

DROP TRIGGER IF EXISTS gallery_updated_at ON gallery_items;
CREATE TRIGGER gallery_updated_at BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
