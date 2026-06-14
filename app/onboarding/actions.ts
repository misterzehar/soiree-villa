'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { computeProfile, type AnswersMap } from '@/lib/matching'
import { createServerSupabase } from '@/lib/supabase'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
}

export async function submitOnboarding(answersMap: AnswersMap) {
  const { profile, rawScores, normalizedAxes } = computeProfile(answersMap)

  const sessionId = crypto.randomUUID()

  const cookieStore = await cookies()
  cookieStore.set('sv_profile', profile.id, COOKIE_OPTS)
  cookieStore.set('sv_axes', JSON.stringify(normalizedAxes), COOKIE_OPTS)
  cookieStore.set('sv_session_id', sessionId, COOKIE_OPTS)

  const supabase = createServerSupabase()
  await supabase.from('onboarding_responses').insert({
    session_id:      sessionId,
    answers:         Object.entries(answersMap).map(([q, choice]) => ({ q: Number(q), choice })),
    computed_profile: profile.id,
    axes_scores:     normalizedAxes,
    // raw_scores for debugging (not a schema column yet — ignored if missing)
  })

  redirect('/onboarding/result')
}
