-- ============================================================
-- Phase 5 — Module B Appels d'offres
-- ============================================================

CREATE TABLE briefs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id          uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  target_type           text NOT NULL CHECK (target_type IN ('lieu', 'fournisseur')),
  target_category       text CHECK (
    (target_type = 'lieu' AND target_category IS NULL)
    OR (target_type = 'fournisseur' AND target_category IN ('traiteur','dj_musique','deco','animation'))
  ),
  city                  text NOT NULL,
  event_date            date NOT NULL,
  expires_at            timestamptz NOT NULL,
  title                 text NOT NULL,
  description           text NOT NULL,
  budget_estimate_cents integer,
  status                text NOT NULL DEFAULT 'open'
                        CHECK (status IN ('draft','open','selected','closed')),
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE offers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id           uuid NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  responder_id       uuid NOT NULL REFERENCES auth.users(id),
  responder_type     text NOT NULL CHECK (responder_type IN ('lieu','fournisseur')),
  responder_name     text NOT NULL,
  amount_cents       integer NOT NULL CHECK (amount_cents > 0),
  platform_fee_cents integer NOT NULL,
  message            text NOT NULL,
  status             text NOT NULL DEFAULT 'submitted'
                     CHECK (status IN ('submitted','shortlisted','selected','rejected')),
  created_at         timestamptz DEFAULT now(),
  UNIQUE (brief_id, responder_id)
);

-- ─── Helper functions ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION user_owns_brief(brief_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM briefs b
    JOIN organizers o ON o.id = b.organizer_id
    WHERE b.id = brief_id AND o.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION user_can_see_brief(brief_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_owns_brief(brief_id)
  OR EXISTS (
    SELECT 1 FROM briefs b
    JOIN lieux l ON l.claimed_by_user_id = auth.uid()
    WHERE b.id = brief_id
      AND b.target_type = 'lieu'
      AND b.city = l.city
      AND b.status = 'open'
      AND l.is_approved = true
  )
  OR EXISTS (
    SELECT 1 FROM briefs b
    JOIN fournisseurs f ON f.claimed_by_user_id = auth.uid()
    WHERE b.id = brief_id
      AND b.target_type = 'fournisseur'
      AND b.target_category = f.category
      AND b.city = f.city
      AND b.status = 'open'
      AND f.is_approved = true
  )
$$;

CREATE OR REPLACE FUNCTION user_can_see_offer(offer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM offers o
    JOIN briefs b ON b.id = o.brief_id
    WHERE o.id = offer_id AND user_owns_brief(b.id)
  )
  OR EXISTS (
    SELECT 1 FROM offers o
    WHERE o.id = offer_id AND o.responder_id = auth.uid()
  )
$$;

-- ─── RLS : briefs ──────────────────────────────────────────────
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefs_select" ON briefs FOR SELECT
USING (user_can_see_brief(id));

CREATE POLICY "briefs_insert" ON briefs FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizers o WHERE o.id = organizer_id AND o.user_id = auth.uid()
  )
);

CREATE POLICY "briefs_update" ON briefs FOR UPDATE TO authenticated
USING (user_owns_brief(id))
WITH CHECK (user_owns_brief(id));

-- ─── RLS : offers ──────────────────────────────────────────────
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers_select" ON offers FOR SELECT
USING (user_can_see_offer(id));

CREATE POLICY "offers_insert" ON offers FOR INSERT TO authenticated
WITH CHECK (
  responder_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM briefs b WHERE b.id = brief_id AND b.status = 'open'
  )
  AND (
    (responder_type = 'lieu' AND EXISTS (
      SELECT 1 FROM lieux l
      JOIN briefs b ON b.id = brief_id
      WHERE l.claimed_by_user_id = auth.uid() AND l.is_approved = true AND l.city = b.city
    ))
    OR
    (responder_type = 'fournisseur' AND EXISTS (
      SELECT 1 FROM fournisseurs f
      JOIN briefs b ON b.id = brief_id
      WHERE f.claimed_by_user_id = auth.uid() AND f.is_approved = true
        AND f.city = b.city AND f.category = b.target_category
    ))
  )
);

-- Organizer updates status; responder updates own submitted offer
CREATE POLICY "offers_update" ON offers FOR UPDATE TO authenticated
USING (
  user_owns_brief(brief_id)
  OR (responder_id = auth.uid() AND status = 'submitted')
)
WITH CHECK (
  user_owns_brief(brief_id)
  OR (responder_id = auth.uid() AND status = 'submitted')
);
