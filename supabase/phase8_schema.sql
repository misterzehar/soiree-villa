-- ─── Phase 8 — Module E : Marketplace prestataires ──────────────────────────
-- Run in Supabase SQL editor after phase7_schema.sql

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type  text        NOT NULL CHECK (target_type IN ('lieu', 'fournisseur')),
  target_id    uuid        NOT NULL,
  author_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  text        NOT NULL,
  rating       int         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      text,
  is_published bool        NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type  text        NOT NULL CHECK (target_type IN ('lieu', 'fournisseur')),
  target_id    uuid        NOT NULL,
  sender_name  text        NOT NULL,
  sender_email text        NOT NULL,
  message      text        NOT NULL,
  is_read      bool        NOT NULL DEFAULT false,
  is_archived  bool        NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS reviews_target_idx
  ON reviews(target_type, target_id);

CREATE INDEX IF NOT EXISTS reviews_published_idx
  ON reviews(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_requests_target_idx
  ON contact_requests(target_type, target_id);

CREATE INDEX IF NOT EXISTS contact_requests_archived_idx
  ON contact_requests(is_archived, created_at DESC);

-- ── avg_rating helper ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION avg_rating(p_type text, p_id uuid)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  FROM reviews
  WHERE target_type = p_type AND target_id = p_id AND is_published = true
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- reviews: published ones visible to everyone
CREATE POLICY "reviews_select_published" ON reviews
  FOR SELECT USING (is_published = true);

-- reviews: authenticated users can insert
CREATE POLICY "reviews_insert_auth" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- contact_requests: anyone can insert (contact form, no auth required)
CREATE POLICY "contact_requests_insert_anon" ON contact_requests
  FOR INSERT WITH CHECK (true);

-- contact_requests: lieu owner can see their own
CREATE POLICY "contact_requests_select_lieu" ON contact_requests
  FOR SELECT USING (
    target_type = 'lieu'
    AND EXISTS (
      SELECT 1 FROM lieux l
      WHERE l.id = contact_requests.target_id
        AND l.claimed_by_user_id = auth.uid()
    )
  );

-- contact_requests: fournisseur owner can see their own
CREATE POLICY "contact_requests_select_fournisseur" ON contact_requests
  FOR SELECT USING (
    target_type = 'fournisseur'
    AND EXISTS (
      SELECT 1 FROM fournisseurs f
      WHERE f.id = contact_requests.target_id
        AND f.claimed_by_user_id = auth.uid()
    )
  );

-- contact_requests: lieu owner can update (mark read/archived)
CREATE POLICY "contact_requests_update_lieu" ON contact_requests
  FOR UPDATE USING (
    target_type = 'lieu'
    AND EXISTS (
      SELECT 1 FROM lieux l
      WHERE l.id = contact_requests.target_id
        AND l.claimed_by_user_id = auth.uid()
    )
  );

-- contact_requests: fournisseur owner can update
CREATE POLICY "contact_requests_update_fournisseur" ON contact_requests
  FOR UPDATE USING (
    target_type = 'fournisseur'
    AND EXISTS (
      SELECT 1 FROM fournisseurs f
      WHERE f.id = contact_requests.target_id
        AND f.claimed_by_user_id = auth.uid()
    )
  );
