-- Tighten inquiry RLS to match application RBAC roles

CREATE OR REPLACE FUNCTION public.can_read_inquiries()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'content_admin', 'academy_staff')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_manage_inquiries()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'academy_staff')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Academy applications
DROP POLICY IF EXISTS "Admin read applications" ON academy_applications;
DROP POLICY IF EXISTS "Admin read academy applications" ON academy_applications;
CREATE POLICY "Admin read academy applications" ON academy_applications FOR SELECT USING (
  public.can_read_inquiries()
);

DROP POLICY IF EXISTS "Admin update applications" ON academy_applications;
DROP POLICY IF EXISTS "Admin update academy applications" ON academy_applications;
CREATE POLICY "Admin update academy applications" ON academy_applications FOR UPDATE USING (
  public.can_manage_inquiries()
);

-- Scout inquiries
DROP POLICY IF EXISTS "Admin read scout inquiries" ON scout_inquiries;
CREATE POLICY "Admin read scout inquiries" ON scout_inquiries FOR SELECT USING (
  public.can_read_inquiries()
);

DROP POLICY IF EXISTS "Admin update scout inquiries" ON scout_inquiries;
CREATE POLICY "Admin update scout inquiries" ON scout_inquiries FOR UPDATE USING (
  public.can_manage_inquiries()
);

DROP POLICY IF EXISTS "Admin delete scout inquiries" ON scout_inquiries;
CREATE POLICY "Admin delete scout inquiries" ON scout_inquiries FOR DELETE USING (
  public.can_manage_inquiries()
);

-- Contact inquiries
DROP POLICY IF EXISTS "Admin read contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin read contact inquiries" ON contact_inquiries FOR SELECT USING (
  public.can_read_inquiries()
);

DROP POLICY IF EXISTS "Admin update contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin update contact inquiries" ON contact_inquiries FOR UPDATE USING (
  public.can_manage_inquiries()
);

DROP POLICY IF EXISTS "Admin delete contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin delete contact inquiries" ON contact_inquiries FOR DELETE USING (
  public.can_manage_inquiries()
);
