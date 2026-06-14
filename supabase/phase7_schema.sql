-- Phase 7 — Matching automatique 6D
-- À exécuter dans le SQL Editor Supabase

-- 1. Colonne axes_scores sur experiences (6 axes cible dérivés des profils compatibles)
ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS axes_scores jsonb;

-- 2. Colonne legacy_profile_id sur onboarding_responses (pour migration douce)
ALTER TABLE onboarding_responses
  ADD COLUMN IF NOT EXISTS legacy_profile_id text;

-- 3. Fonction SQL match_score (distance euclidienne 6D, valeurs {-1, 0, 1})
--    Peut être appelée côté serveur pour des requêtes RPC futures.
CREATE OR REPLACE FUNCTION public.match_score(user_axes jsonb, exp_axes jsonb)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  axes   text[]  := ARRAY['energy', 'structure', 'depth', 'sociality', 'cerebrale', 'creativite'];
  ax     text;
  dist_sq float  := 0;
  ua     float;
  ea     float;
BEGIN
  FOREACH ax IN ARRAY axes LOOP
    ua      := COALESCE((user_axes  ->> ax)::float, 0);
    ea      := COALESCE((exp_axes   ->> ax)::float, 0);
    dist_sq := dist_sq + (ua - ea) * (ua - ea);
  END LOOP;
  RETURN GREATEST(0, ROUND(100.0 * (1.0 - SQRT(dist_sq) / SQRT(24.0))));
END;
$$;

-- 4. Index GIN pour accélérer les requêtes sur axes_scores
CREATE INDEX IF NOT EXISTS experiences_axes_scores_idx
  ON experiences USING gin (axes_scores);

-- 5. Commentaires
COMMENT ON COLUMN experiences.axes_scores    IS '6D axes target dérivé de compatible_profiles ({energy,structure,depth,sociality,cerebrale,creativite} ∈ {-1,0,1})';
COMMENT ON COLUMN onboarding_responses.legacy_profile_id IS 'Ancien profileId (6 profils MVP) conservé pour migration vers les 20 profils';
