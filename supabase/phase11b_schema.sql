-- Phase 11b: TierMaker interactif

-- Tier lists individuelles
CREATE TABLE IF NOT EXISTS user_tier_lists (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL,
  category    text        NOT NULL CHECK (category IN ('experiences-mine', 'experiences-all', 'lieux', 'fournisseurs')),
  items_by_tier jsonb     NOT NULL DEFAULT '{"S":[],"A":[],"B":[],"C":[],"D":[]}',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

ALTER TABLE user_tier_lists ENABLE ROW LEVEL SECURITY;

-- Utilisateur lit et modifie uniquement les siennes
CREATE POLICY "tier_list_select_own" ON user_tier_lists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "tier_list_insert_own" ON user_tier_lists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tier_list_update_own" ON user_tier_lists
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Tier lists publiques lisibles par tous (pour /tier-list/[username]/[category])
CREATE POLICY "tier_list_select_public" ON user_tier_lists
  FOR SELECT TO anon USING (true);

-- Snapshot agrégé communauté (recalculé chaque nuit par le cron)
CREATE TABLE IF NOT EXISTS community_tier_snapshot (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text        NOT NULL,
  item_id     text        NOT NULL,
  tier        text        NOT NULL,
  avg_score   numeric     NOT NULL,
  vote_count  int         NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category, item_id)
);

ALTER TABLE community_tier_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_snapshot_select_all" ON community_tier_snapshot
  FOR SELECT USING (true);

-- RLS: service role peut écrire le snapshot
CREATE POLICY "community_snapshot_upsert_service" ON community_tier_snapshot
  FOR ALL TO service_role USING (true) WITH CHECK (true);
