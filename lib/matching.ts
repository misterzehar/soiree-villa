import { QUESTIONS } from '@/constants/onboarding-questions'
import { PROFILES, type AxesTarget, type Profile } from '@/constants/profiles'

export type AxesRaw = {
  energy:     number
  structure:  number
  depth:      number
  sociality:  number
  cerebrale:  number
  creativite: number
}

export type AnswersMap = Record<number, 'A' | 'B'>

export const AXES = ['energy', 'structure', 'depth', 'sociality', 'cerebrale', 'creativite'] as const

// Max euclidean distance in 6D with values {-1,0,1}: sqrt(6 × 4) = sqrt(24)
const MAX_DISTANCE = Math.sqrt(24)

export function computeRawScores(answers: AnswersMap): AxesRaw {
  const scores: AxesRaw = { energy: 0, structure: 0, depth: 0, sociality: 0, cerebrale: 0, creativite: 0 }
  for (const [qId, choice] of Object.entries(answers)) {
    const q = QUESTIONS.find(x => x.id === Number(qId))
    if (!q) continue
    scores[q.axis] += choice === 'A' ? q.optionA.value : q.optionB.value
  }
  return scores
}

export function normalizeAxes(raw: AxesRaw): AxesTarget {
  return {
    energy:     raw.energy     > 0 ? 1 : raw.energy     < 0 ? -1 : 0,
    structure:  raw.structure  > 0 ? 1 : raw.structure  < 0 ? -1 : 0,
    depth:      raw.depth      > 0 ? 1 : raw.depth      < 0 ? -1 : 0,
    sociality:  raw.sociality  > 0 ? 1 : raw.sociality  < 0 ? -1 : 0,
    cerebrale:  raw.cerebrale  > 0 ? 1 : raw.cerebrale  < 0 ? -1 : 0,
    creativite: raw.creativite > 0 ? 1 : raw.creativite < 0 ? -1 : 0,
  }
}

export function matchScore(userAxes: AxesTarget, targetAxes: AxesTarget): number {
  let distSq = 0
  for (const ax of AXES) {
    const d = userAxes[ax] - targetAxes[ax]
    distSq += d * d
  }
  return Math.max(0, Math.round(100 * (1 - Math.sqrt(distSq) / MAX_DISTANCE)))
}

// Derives a 6D axes_target for an experience by averaging its compatible profiles.
// If a profile is in compatible_profiles and the user's profileId matches → caller should override with 100.
export function deriveExperienceAxes(compatibleProfileIds: string[]): AxesTarget {
  const profiles = compatibleProfileIds
    .map(id => PROFILES.find(p => p.id === id))
    .filter((p): p is Profile => p !== undefined)

  if (profiles.length === 0) {
    return { energy: 0, structure: 0, depth: 0, sociality: 0, cerebrale: 0, creativite: 0 }
  }

  const totals: Record<string, number> = { energy: 0, structure: 0, depth: 0, sociality: 0, cerebrale: 0, creativite: 0 }
  for (const p of profiles) {
    for (const ax of AXES) totals[ax] += p.axes_target[ax]
  }

  function thresh(v: number): -1 | 0 | 1 {
    return v > 0.3 ? 1 : v < -0.3 ? -1 : 0
  }

  return {
    energy:     thresh(totals.energy     / profiles.length),
    structure:  thresh(totals.structure  / profiles.length),
    depth:      thresh(totals.depth      / profiles.length),
    sociality:  thresh(totals.sociality  / profiles.length),
    cerebrale:  thresh(totals.cerebrale  / profiles.length),
    creativite: thresh(totals.creativite / profiles.length),
  }
}

export function computeProfile(answers: AnswersMap): {
  profile: Profile
  rawScores: AxesRaw
  normalizedAxes: AxesTarget
} {
  const rawScores = computeRawScores(answers)
  const normalizedAxes = normalizeAxes(rawScores)

  const ranked = PROFILES
    .map(p => ({ p, score: matchScore(normalizedAxes, p.axes_target) }))
    .sort((a, b) => b.score - a.score)

  return { profile: ranked[0].p, rawScores, normalizedAxes }
}
