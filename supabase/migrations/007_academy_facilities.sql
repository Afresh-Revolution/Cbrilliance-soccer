-- 007: Academy facilities section (editable from admin)

CREATE TABLE IF NOT EXISTS academy_facility_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  section_label TEXT NOT NULL DEFAULT 'Facilities',
  section_heading TEXT NOT NULL DEFAULT 'World-Class Environment',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO academy_facility_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS academy_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE academy_facility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_facilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read academy facility settings" ON academy_facility_settings;
CREATE POLICY "Public read academy facility settings" ON academy_facility_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read academy facilities" ON academy_facilities;
CREATE POLICY "Public read academy facilities" ON academy_facilities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access academy facility settings" ON academy_facility_settings;
CREATE POLICY "Admin full access academy facility settings" ON academy_facility_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'content_admin')
  )
);

DROP POLICY IF EXISTS "Admin full access academy facilities" ON academy_facilities;
CREATE POLICY "Admin full access academy facilities" ON academy_facilities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'content_admin')
  )
);

CREATE INDEX IF NOT EXISTS idx_academy_facilities_sort_order ON academy_facilities(sort_order);

DROP TRIGGER IF EXISTS academy_facilities_updated_at ON academy_facilities;
CREATE TRIGGER academy_facilities_updated_at BEFORE UPDATE ON academy_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS academy_facility_settings_updated_at ON academy_facility_settings;
CREATE TRIGGER academy_facility_settings_updated_at BEFORE UPDATE ON academy_facility_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
