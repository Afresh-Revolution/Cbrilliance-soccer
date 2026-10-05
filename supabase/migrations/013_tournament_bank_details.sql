-- 013: Bank account details shown on the tournament registration form

CREATE TABLE IF NOT EXISTS tournament_bank_details (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bank_name TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  payment_note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tournament_bank_details (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE tournament_bank_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tournament bank details" ON tournament_bank_details;
CREATE POLICY "Public read tournament bank details" ON tournament_bank_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update tournament bank details" ON tournament_bank_details;
CREATE POLICY "Admin update tournament bank details" ON tournament_bank_details FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);

DROP TRIGGER IF EXISTS tournament_bank_details_updated_at ON tournament_bank_details;
CREATE TRIGGER tournament_bank_details_updated_at BEFORE UPDATE ON tournament_bank_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
