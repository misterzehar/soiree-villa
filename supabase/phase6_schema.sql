-- ─── Phase 6 — Module C : Devis combinatoires ──────────────────────────────
-- Run in Supabase SQL editor after phase5_schema.sql

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id       uuid        NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  client_name        text        NOT NULL,
  client_email       text        NOT NULL,
  event_date         date        NOT NULL,
  description        text,
  total_cents        int         NOT NULL DEFAULT 0,
  platform_fee_cents int         NOT NULL DEFAULT 0,
  status             text        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','sent','accepted','rejected','cancelled')),
  share_token        uuid        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  pdf_path           text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_lines (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        uuid        NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_type       text        NOT NULL CHECK (line_type IN ('lieu', 'fournisseur')),
  lieu_id         uuid        REFERENCES lieux(id),
  fournisseur_id  uuid        REFERENCES fournisseurs(id),
  label           text        NOT NULL,
  amount_cents    int         NOT NULL DEFAULT 0,
  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id         uuid        NOT NULL REFERENCES quotes(id),
  recipient_type   text        NOT NULL CHECK (recipient_type IN ('lieu', 'fournisseur')),
  recipient_id     uuid        NOT NULL,
  recipient_name   text        NOT NULL,
  amount_cents     int         NOT NULL,
  platform_fee_cents int       NOT NULL,
  accepted_at      timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── Updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS quotes_updated_at ON quotes;
CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_quotes_updated_at();

-- ── Storage bucket ───────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes-pdf', 'quotes-pdf', false)
ON CONFLICT DO NOTHING;

-- Authenticated users can upload (server actions use service role, so this
-- policy is a safety net; all reads use service-role-generated signed URLs)
CREATE POLICY "quotes-pdf insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quotes-pdf');

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE quotes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts    ENABLE ROW LEVEL SECURITY;

-- quotes: organizer sees and manages their own
CREATE POLICY "quotes_select_organizer" ON quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM organizers o WHERE o.id = quotes.organizer_id AND o.user_id = auth.uid())
);
CREATE POLICY "quotes_insert_organizer" ON quotes FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (SELECT 1 FROM organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid())
);
CREATE POLICY "quotes_update_organizer" ON quotes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM organizers o WHERE o.id = quotes.organizer_id AND o.user_id = auth.uid())
);

-- quote_lines: organizer sees via their quote
CREATE POLICY "quote_lines_select" ON quote_lines FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quotes q
    JOIN organizers o ON o.id = q.organizer_id
    WHERE q.id = quote_lines.quote_id AND o.user_id = auth.uid()
  )
);
CREATE POLICY "quote_lines_insert" ON quote_lines FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM quotes q
    JOIN organizers o ON o.id = q.organizer_id
    WHERE q.id = quote_id AND o.user_id = auth.uid()
  )
);

-- contracts: organizer sees via quote; lieu/fournisseur sees their own
CREATE POLICY "contracts_select_organizer" ON contracts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quotes q
    JOIN organizers o ON o.id = q.organizer_id
    WHERE q.id = contracts.quote_id AND o.user_id = auth.uid()
  )
);
CREATE POLICY "contracts_select_lieu" ON contracts FOR SELECT USING (
  recipient_type = 'lieu'
  AND EXISTS (SELECT 1 FROM lieux l WHERE l.id = contracts.recipient_id AND l.claimed_by_user_id = auth.uid())
);
CREATE POLICY "contracts_select_fournisseur" ON contracts FOR SELECT USING (
  recipient_type = 'fournisseur'
  AND EXISTS (SELECT 1 FROM fournisseurs f WHERE f.id = contracts.recipient_id AND f.claimed_by_user_id = auth.uid())
);
