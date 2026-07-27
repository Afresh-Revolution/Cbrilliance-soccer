-- CBFC Database Schema for Supabase
-- Run this in Supabase SQL Editor for a fresh project.
--
-- Tables: profiles, players, academy_applications, scout_inquiries,
--         contact_inquiries, news_articles, videos, club_staff, fixtures,
--         gallery_items, shop_products, activity_items, site_stats, club_stats, audit_logs
--
-- Existing projects: run migrations in order (002 → 010) instead.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'academy_staff' CHECK (role IN ('super_admin', 'content_admin', 'academy_staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  profile_photo TEXT,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
  height TEXT,
  weight TEXT,
  preferred_foot TEXT CHECK (preferred_foot IN ('left', 'right', 'both')),
  biography TEXT,
  strengths JSONB DEFAULT '{}',
  statistics JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '[]',
  previous_clubs JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  movement_history JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'in_development'
    CHECK (status IN (
      'available_for_trials', 'on_trial', 'abroad',
      'in_development', 'professional_squad', 'in_camp'
    )),
  academy_graduate BOOLEAN DEFAULT FALSE,
  professional_player BOOLEAN DEFAULT FALSE,
  jersey_number INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academy Applications
CREATE TABLE IF NOT EXISTS academy_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  position TEXT NOT NULL,
  height TEXT,
  preferred_foot TEXT,
  parent_guardian_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  previous_club TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'contacted', 'closed', 'reviewed', 'invited', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scout Inquiries
CREATE TABLE IF NOT EXISTS scout_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scout_name TEXT NOT NULL,
  club_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  author TEXT DEFAULT 'CBFC Media',
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  thumbnail TEXT,
  video_url TEXT NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player_name TEXT,
  position TEXT,
  age_category TEXT,
  duration TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club Staff
CREATE TABLE IF NOT EXISTS club_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo TEXT,
  bio TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Fixtures
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  competition TEXT,
  is_upcoming BOOLEAN DEFAULT TRUE
);

-- Gallery Items
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop Products
CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('jerseys', 'shorts', 'socks', 'boots')),
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS activity_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  player_id UUID REFERENCES players(id) ON DELETE SET NULL
);

-- Site Stats (singleton)
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  registered_players INTEGER DEFAULT 0,
  academy_graduates INTEGER DEFAULT 0,
  players_abroad INTEGER DEFAULT 0,
  players_on_trial INTEGER DEFAULT 0,
  scout_requests INTEGER DEFAULT 0,
  club_matches_played INTEGER DEFAULT 0,
  professional_placements INTEGER DEFAULT 0
);

-- Club Stats (singleton)
CREATE TABLE IF NOT EXISTS club_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  players_developed INTEGER DEFAULT 0,
  league_position INTEGER DEFAULT 0
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_stats ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public read players" ON players;
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read published news" ON news_articles;
CREATE POLICY "Public read published news" ON news_articles FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read videos" ON videos;
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read club staff" ON club_staff;
CREATE POLICY "Public read club staff" ON club_staff FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read fixtures" ON fixtures;
CREATE POLICY "Public read fixtures" ON fixtures FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read gallery" ON gallery_items;
CREATE POLICY "Public read gallery" ON gallery_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read shop products" ON shop_products;
CREATE POLICY "Public read shop products" ON shop_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read activity" ON activity_items;
CREATE POLICY "Public read activity" ON activity_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read site stats" ON site_stats;
CREATE POLICY "Public read site stats" ON site_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read club stats" ON club_stats;
CREATE POLICY "Public read club stats" ON club_stats FOR SELECT USING (true);

-- Public insert for forms
DROP POLICY IF EXISTS "Public insert academy applications" ON academy_applications;
CREATE POLICY "Public insert academy applications" ON academy_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert scout inquiries" ON scout_inquiries;
CREATE POLICY "Public insert scout inquiries" ON scout_inquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert contact inquiries" ON contact_inquiries;
CREATE POLICY "Public insert contact inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users with admin role)
DROP POLICY IF EXISTS "Admin full access players" ON players;
CREATE POLICY "Admin full access players" ON players FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);
DROP POLICY IF EXISTS "Admin full access news" ON news_articles;
CREATE POLICY "Admin full access news" ON news_articles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);
DROP POLICY IF EXISTS "Admin read applications" ON academy_applications;
CREATE POLICY "Admin read applications" ON academy_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin update applications" ON academy_applications;
CREATE POLICY "Admin update applications" ON academy_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin read scout inquiries" ON scout_inquiries;
CREATE POLICY "Admin read scout inquiries" ON scout_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin update scout inquiries" ON scout_inquiries;
CREATE POLICY "Admin update scout inquiries" ON scout_inquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin read contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin read contact inquiries" ON contact_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin update contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin update contact inquiries" ON contact_inquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin delete scout inquiries" ON scout_inquiries;
CREATE POLICY "Admin delete scout inquiries" ON scout_inquiries FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin delete contact inquiries" ON contact_inquiries;
CREATE POLICY "Admin delete contact inquiries" ON contact_inquiries FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
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
DROP POLICY IF EXISTS "Admin full access gallery" ON gallery_items;
CREATE POLICY "Admin full access gallery" ON gallery_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);
DROP POLICY IF EXISTS "Admin full access shop products" ON shop_products;
CREATE POLICY "Admin full access shop products" ON shop_products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'content_admin'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_slug ON players(slug);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_players_featured ON players(featured);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published);
CREATE INDEX IF NOT EXISTS idx_club_staff_sort_order ON club_staff(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_sort_order ON shop_products(sort_order);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category);
CREATE INDEX IF NOT EXISTS idx_scout_inquiries_status ON scout_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_scout_inquiries_created ON scout_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academy_applications_status ON academy_applications(status);
CREATE INDEX IF NOT EXISTS idx_academy_applications_created ON academy_applications(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS players_updated_at ON players;
CREATE TRIGGER players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS news_updated_at ON news_articles;
CREATE TRIGGER news_updated_at BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS gallery_updated_at ON gallery_items;
CREATE TRIGGER gallery_updated_at BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS shop_products_updated_at ON shop_products;
CREATE TRIGGER shop_products_updated_at BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default stats
INSERT INTO site_stats (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO club_stats (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin read audit logs" ON audit_logs;
CREATE POLICY "Super admin read audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Super admin read all profiles" ON profiles;
CREATE POLICY "Super admin read all profiles" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Super admin manage profiles" ON profiles;
CREATE POLICY "Super admin manage profiles" ON profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'academy_staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
