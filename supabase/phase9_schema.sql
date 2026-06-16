-- ─── Phase 9 — Module D : Back-office OPRAH ─────────────────────────────────
-- Run in Supabase SQL editor after phase8_schema.sql

CREATE TABLE IF NOT EXISTS admin_notes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content    text        NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS enabled with no policies = service role only
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Singleton row with fixed UUID
INSERT INTO admin_notes (id, content)
VALUES ('00000000-0000-0000-0000-000000000001', '')
ON CONFLICT (id) DO NOTHING;
