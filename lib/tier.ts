import { createServerSupabase } from './supabase'

export type TierLabel = 'S' | 'A' | 'B' | 'C' | 'D'

export const TIER_CONFIG: Record<TierLabel, { label: string; color: string; bg: string }> = {
  S: { label: 'Tier S', color: 'text-warning',  bg: 'bg-warning/10 border-warning/30' },
  A: { label: 'Tier A', color: 'text-success',  bg: 'bg-success/10 border-success/30' },
  B: { label: 'Tier B', color: 'text-primary',  bg: 'bg-primary/10 border-primary/30' },
  C: { label: 'Tier C', color: 'text-text-muted', bg: 'bg-surface border-border' },
  D: { label: 'Tier D', color: 'text-error',    bg: 'bg-error/5 border-error/20' },
}

function computeScore(npsAvg: number, fillRate: number, reviewCount: number): number {
  return (npsAvg / 10) * 0.5 + fillRate * 0.3 + Math.min(reviewCount / 10, 1) * 0.2
}

function assignTiersFromScored(scored: { id: string; score: number }[]): Record<string, TierLabel> {
  if (scored.length === 0) return {}
  const sorted = [...scored].sort((a, b) => b.score - a.score)
  const n = sorted.length
  const result: Record<string, TierLabel> = {}
  sorted.forEach(({ id }, i) => {
    const pct = i / n
    if (pct < 0.10)      result[id] = 'S'
    else if (pct < 0.30) result[id] = 'A'
    else if (pct < 0.60) result[id] = 'B'
    else if (pct < 0.90) result[id] = 'C'
    else                 result[id] = 'D'
  })
  return result
}

export type TierDataRow = {
  id: string
  score: number
  npsAvg: number
  fillRate: number
  reviewCount: number
  tier: TierLabel
}

export async function fetchTierData(
  supabase: ReturnType<typeof createServerSupabase>,
  expIds: string[],
): Promise<{ tiers: Record<string, TierLabel>; rows: TierDataRow[] }> {
  if (expIds.length === 0) return { tiers: {}, rows: [] }

  const [
    { data: expsData },
    { data: regsData },
  ] = await Promise.all([
    supabase
      .from('experiences')
      .select('id, capacity_max, capacity_current')
      .in('id', expIds),
    supabase
      .from('registrations')
      .select('id, experience_id')
      .in('experience_id', expIds)
      .eq('payment_status', 'paid'),
  ])

  const regIds = (regsData ?? []).map(r => r.id)
  const regToExp: Record<string, string> = {}
  for (const r of regsData ?? []) regToExp[r.id] = r.experience_id

  const npsScoresByExp: Record<string, number[]> = {}
  if (regIds.length > 0) {
    const { data: npsData } = await supabase
      .from('nps_responses')
      .select('registration_id, score')
      .in('registration_id', regIds)
    for (const n of npsData ?? []) {
      const expId = regToExp[n.registration_id]
      if (expId) {
        if (!npsScoresByExp[expId]) npsScoresByExp[expId] = []
        npsScoresByExp[expId].push(n.score)
      }
    }
  }

  const scored: { id: string; score: number; npsAvg: number; fillRate: number; reviewCount: number }[] = []
  for (const exp of expsData ?? []) {
    const fillRate = exp.capacity_max > 0 ? exp.capacity_current / exp.capacity_max : 0
    const npsArr = npsScoresByExp[exp.id] ?? []
    const npsAvg = npsArr.length > 0 ? npsArr.reduce((a, b) => a + b, 0) / npsArr.length : 5
    scored.push({ id: exp.id, score: computeScore(npsAvg, fillRate, 0), npsAvg, fillRate, reviewCount: 0 })
  }

  const tiers = assignTiersFromScored(scored)
  const rows = scored.map(s => ({ ...s, tier: tiers[s.id] ?? 'C' }))

  return { tiers, rows }
}
