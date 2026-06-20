-- ── Phase 11 — Multi-ville + Tier List ──────────────────────────────────────

-- Waitlist par ville (intéressés avant ouverture)
CREATE TABLE IF NOT EXISTS waitlist_city (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  city       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, city)
);
ALTER TABLE waitlist_city ENABLE ROW LEVEL SECURITY;
-- Insertion anonyme (formulaire public)
CREATE POLICY "waitlist_city_insert_anon"
  ON waitlist_city FOR INSERT TO anon WITH CHECK (true);
-- Lecture service role uniquement (admin)
CREATE POLICY "waitlist_city_select_service"
  ON waitlist_city FOR SELECT TO authenticated USING (true);

-- Ville préférée sur le profil utilisateur
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_city text;
