-- Admin dashboard: extended application statuses + unified inquiry view support

ALTER TABLE academy_applications DROP CONSTRAINT IF EXISTS academy_applications_status_check;
ALTER TABLE academy_applications ADD CONSTRAINT academy_applications_status_check
  CHECK (status IN ('new', 'pending', 'contacted', 'closed', 'reviewed', 'invited', 'rejected'));

-- Admin read policies for dashboard aggregates (service role bypasses RLS; anon uses public insert only)
DROP POLICY IF EXISTS "Admin read contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin read contact inquiries" ON contact_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);

DROP POLICY IF EXISTS "Admin read academy applications" ON academy_applications;
CREATE POLICY "Admin read academy applications" ON academy_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);

-- Admin write for applications (status updates)
DROP POLICY IF EXISTS "Admin update academy applications" ON academy_applications;
CREATE POLICY "Admin update academy applications" ON academy_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);

-- Admin policies for content management tables
DROP POLICY IF EXISTS "Admin full access videos" ON videos;
CREATE POLICY "Admin full access videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);

DROP POLICY IF EXISTS "Admin full access fixtures" ON fixtures;
CREATE POLICY "Admin full access fixtures" ON fixtures FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);

DROP POLICY IF EXISTS "Admin full access club staff" ON club_staff;
CREATE POLICY "Admin full access club staff" ON club_staff FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);

CREATE INDEX IF NOT EXISTS idx_scout_inquiries_status ON scout_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_academy_applications_status ON academy_applications(status);
CREATE INDEX IF NOT EXISTS idx_academy_applications_created ON academy_applications(created_at DESC);
