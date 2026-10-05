-- 012: CBrilliance Football Agency tournament registrations and squads

CREATE TABLE IF NOT EXISTS tournament_registration_counters (
  year INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_code TEXT UNIQUE NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  team_short_name TEXT,
  team_location TEXT NOT NULL,
  home_ground TEXT,
  team_logo_url TEXT,
  official_full_name TEXT NOT NULL,
  official_phone TEXT NOT NULL,
  official_whatsapp TEXT,
  official_email TEXT,
  official_positions TEXT[] NOT NULL,
  player_count INTEGER NOT NULL CHECK (player_count BETWEEN 15 AND 18),
  team_captain TEXT,
  coach_name TEXT,
  assistant_coach TEXT,
  jersey_home TEXT NOT NULL,
  jersey_away TEXT,
  confirm_accurate BOOLEAN NOT NULL,
  agree_rules BOOLEAN NOT NULL,
  understand_verification BOOLEAN NOT NULL,
  consent_media BOOLEAN NOT NULL,
  representative_name TEXT NOT NULL,
  digital_signature TEXT NOT NULL,
  registration_fee_amount INTEGER NOT NULL DEFAULT 35500,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method = 'bank_transfer'),
  payment_reference TEXT NOT NULL,
  payment_receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tournament_positions_valid CHECK (
    cardinality(official_positions) >= 1
    AND official_positions <@ ARRAY['team_manager', 'coach', 'team_representative', 'club_official']::TEXT[]
  ),
  CONSTRAINT tournament_declarations_accepted CHECK (
    confirm_accurate AND agree_rules AND understand_verification AND consent_media
  )
);

CREATE TABLE IF NOT EXISTS tournament_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  squad_number INTEGER NOT NULL CHECK (squad_number BETWEEN 1 AND 99),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (registration_id, squad_number)
);

ALTER TABLE tournament_registration_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read tournament registrations" ON tournament_registrations;
CREATE POLICY "Admin read tournament registrations" ON tournament_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin update tournament registrations" ON tournament_registrations;
CREATE POLICY "Admin update tournament registrations" ON tournament_registrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);
DROP POLICY IF EXISTS "Admin read tournament players" ON tournament_players;
CREATE POLICY "Admin read tournament players" ON tournament_players FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(status);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_created ON tournament_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_players_registration ON tournament_players(registration_id);

DROP TRIGGER IF EXISTS tournament_registrations_updated_at ON tournament_registrations;
CREATE TRIGGER tournament_registrations_updated_at BEFORE UPDATE ON tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION public.next_tournament_registration_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yr INT := EXTRACT(YEAR FROM NOW())::INT;
  n INT;
BEGIN
  INSERT INTO tournament_registration_counters (year, last_number)
  VALUES (yr, 1)
  ON CONFLICT (year) DO UPDATE
    SET last_number = tournament_registration_counters.last_number + 1
  RETURNING last_number INTO n;

  RETURN 'CBFC-' || yr::TEXT || '-' || lpad(n::TEXT, 3, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.next_tournament_registration_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_tournament_registration_code() TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_tournament_squad_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  squad_status TEXT;
  max_players INT;
  current_count INT;
BEGIN
  SELECT status, player_count INTO squad_status, max_players
  FROM tournament_registrations
  WHERE id = NEW.registration_id;

  IF squad_status IS NULL THEN
    RAISE EXCEPTION 'REGISTRATION_NOT_FOUND';
  END IF;

  IF squad_status IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'SQUAD_LOCKED';
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM tournament_players
  WHERE registration_id = NEW.registration_id;

  IF current_count >= max_players THEN
    RAISE EXCEPTION 'SQUAD_FULL';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tournament_players_squad_limit ON tournament_players;
CREATE TRIGGER tournament_players_squad_limit
  BEFORE INSERT ON tournament_players
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tournament_squad_limit();

CREATE OR REPLACE FUNCTION public.enforce_tournament_squad_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  squad_status TEXT;
BEGIN
  SELECT status INTO squad_status
  FROM tournament_registrations
  WHERE id = OLD.registration_id;

  IF squad_status IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'SQUAD_LOCKED';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tournament_players_squad_delete ON tournament_players;
CREATE TRIGGER tournament_players_squad_delete
  BEFORE DELETE ON tournament_players
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tournament_squad_delete();
