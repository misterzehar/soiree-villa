import { QUESTIONS } from '@/constants/onboarding-questions'
import { PROFILES, type AxesSigns, type Profile } from '@/constants/profiles'

export type AxesScores = {
  energy: number
  structure: number
  depth: number
  sociality: number
}

export type AnswersMap = Record<number, 'A' | 'B'>

function countDifferences(a: AxesSigns, b: AxesSigns): number {
  return (Object.keys(a) as (keyof AxesSigns)[]).filter(k => a[k] !== b[k]).length
}

export function computeProfile(answers: AnswersMap): {
  profile: Profile
  axesScores: AxesScores
} {
  const scores: AxesScores = { energy: 0, structure: 0, depth: 0, sociality: 0 }

  for (const [questionId, choice] of Object.entries(answers)) {
    const q = QUESTIONS.find(x => x.id === Number(questionId))!
    const value = choice === 'A' ? q.optionA.value : q.optionB.value
    scores[q.axis] += value
  }

  const target: AxesSigns = {
    energy:    scores.energy    >= 0 ? 'extra'       : 'intro',
    structure: scores.structure >= 0 ? 'structured'  : 'spontaneous',
    depth:     scores.depth     >= 0 ? 'deep'        : 'light',
    sociality: scores.sociality >= 0 ? 'large'       : 'small',
  }

  const exact = PROFILES.find(p =>
    p.axes.energy    === target.energy    &&
    p.axes.structure === target.structure &&
    p.axes.depth     === target.depth     &&
    p.axes.sociality === target.sociality
  )

  if (exact) return { profile: exact, axesScores: scores }

  const closest = PROFILES
    .map(p => ({ profile: p, distance: countDifferences(p.axes, target) }))
    .sort((a, b) => a.distance - b.distance)[0]

  return { profile: closest.profile, axesScores: scores }
}
