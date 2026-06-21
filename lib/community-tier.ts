import { type SupabaseClient } from '@supabase/supabase-js'
import { TIER_CONFIG, type TierLabel } from './tier'

export type TierCategory = 'experiences-mine' | 'experiences-all' | 'lieux' | 'fournisseurs'

export const TIER_CATEGORY_LABELS: Record<TierCategory, string> = {
  'experiences-mine': 'Mes soirées vécues',
  'experiences-all':  'Toutes les soirées',
  'lieux':            'Lieux',
  'fournisseurs':     'Fournisseurs',
}

export const TIER_WEIGHTS: Record<TierLabel, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 }
const TIERS: TierLabel[] = ['S', 'A', 'B', 'C', 'D']

export type ItemsByTier = Record<TierLabel, string[]>

export function emptyItemsByTier(): ItemsByTier {
  return { S: [], A: [], B: [], C: [], D: [] }
}

export function tierOfItem(items: ItemsByTier, id: string): TierLabel | null {
  for (const t of TIERS) {
    if (items[t].includes(id)) return t
  }
  return null
}

/** Remove an item from all tiers and add it to the target tier. */
export function moveItem(items: ItemsByTier, id: string, targetTier: TierLabel | null): ItemsByTier {
  const next: ItemsByTier = { S: [], A: [], B: [], C: [], D: [] }
  for (const t of TIERS) {
    next[t] = items[t].filter(i => i !== id)
  }
  if (targetTier) next[targetTier] = [...next[targetTier], id]
  return next
}

/** Compute community tier snapshot for a given category from all user_tier_lists rows. */
export function computeCommunitySnapshot(
  rows: { items_by_tier: ItemsByTier }[],
): Record<string, { avgScore: number; tier: TierLabel; voteCount: number }> {
  const scores: Record<string, { sum: number; count: number }> = {}

  for (const row of rows) {
    for (const t of TIERS) {
      for (const id of (row.items_by_tier[t] ?? [])) {
        if (!scores[id]) scores[id] = { sum: 0, count: 0 }
        scores[id].sum += TIER_WEIGHTS[t]
        scores[id].count++
      }
    }
  }

  // Compute avg scores and assign tiers by percentile
  const entries = Object.entries(scores).map(([id, { sum, count }]) => ({
    id,
    avgScore: sum / count,
    voteCount: count,
  }))

  entries.sort((a, b) => b.avgScore - a.avgScore)
  const n = entries.length

  const result: Record<string, { avgScore: number; tier: TierLabel; voteCount: number }> = {}
  for (let i = 0; i < n; i++) {
    const pct = i / n
    const tier: TierLabel = pct < 0.10 ? 'S' : pct < 0.30 ? 'A' : pct < 0.60 ? 'B' : pct < 0.90 ? 'C' : 'D'
    result[entries[i].id] = { avgScore: entries[i].avgScore, tier, voteCount: entries[i].voteCount }
  }

  return result
}

/** Refresh community_tier_snapshot for all categories. Called by cron. */
export async function refreshAllCommunitySnapshots(supabase: SupabaseClient) {
  const categories: TierCategory[] = ['experiences-mine', 'experiences-all', 'lieux', 'fournisseurs']

  for (const category of categories) {
    const { data } = await supabase
      .from('user_tier_lists')
      .select('items_by_tier')
      .eq('category', category)

    if (!data || data.length === 0) continue

    const snapshot = computeCommunitySnapshot(data as { items_by_tier: ItemsByTier }[])
    if (Object.keys(snapshot).length === 0) continue

    const upserts = Object.entries(snapshot).map(([item_id, { avgScore, tier, voteCount }]) => ({
      category,
      item_id,
      tier,
      avg_score: avgScore,
      vote_count: voteCount,
      computed_at: new Date().toISOString(),
    }))

    await supabase
      .from('community_tier_snapshot')
      .upsert(upserts, { onConflict: 'category,item_id' })
  }
}

/** Fetch community snapshot for a given category, returning map of item_id → tier+score. */
export async function fetchCommunitySnapshot(
  supabase: SupabaseClient,
  category: TierCategory,
): Promise<Record<string, { tier: TierLabel; avgScore: number; voteCount: number }>> {
  const { data } = await supabase
    .from('community_tier_snapshot')
    .select('item_id, tier, avg_score, vote_count')
    .eq('category', category)

  const result: Record<string, { tier: TierLabel; avgScore: number; voteCount: number }> = {}
  for (const row of data ?? []) {
    result[row.item_id] = {
      tier: row.tier as TierLabel,
      avgScore: row.avg_score,
      voteCount: row.vote_count,
    }
  }
  return result
}

export { TIER_CONFIG, type TierLabel }
