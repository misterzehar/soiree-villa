-- ─── Phase 10 — Notifications + NPS + Badges + Gamification ─────────────────
-- Run in Supabase SQL editor after phase9_schema.sql

-- ─── NPS responses ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS nps_responses (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid        NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
  score           smallint    NOT NULL CHECK (score BETWEEN 0 AND 10),
  comment         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

-- Public insert: NPS page is accessible without auth
CREATE POLICY "nps_insert_anon"
  ON nps_responses FOR INSERT TO anon WITH CHECK (true);

-- ─── Badges ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS badges_earned (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL,
  badge_id   text        NOT NULL,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;

-- Users can read their own badges
CREATE POLICY "badges_select_own"
  ON badges_earned FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ─── Obsession de la semaine ──────────────────────────────────────────────────

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS is_obsession_of_week bool NOT NULL DEFAULT false;

-- At most one experience can be obsession at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_obsession_of_week
  ON experiences (is_obsession_of_week)
  WHERE is_obsession_of_week = true;

-- ─── Charte acceptance timestamps ────────────────────────────────────────────

ALTER TABLE organizers   ADD COLUMN IF NOT EXISTS charter_accepted_at timestamptz;
ALTER TABLE lieux        ADD COLUMN IF NOT EXISTS charter_accepted_at timestamptz;
ALTER TABLE fournisseurs ADD COLUMN IF NOT EXISTS charter_accepted_at timestamptz;
