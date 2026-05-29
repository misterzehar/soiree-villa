'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { computeProfile, type AnswersMap } from '@/lib/matching'
import { createServerSupabase } from '@/lib/supabase'

export async function submitOnboarding(answersMap: AnswersMap) {
  const { profile, axesScores } = computeProfile(answersMap)

  const sessionId = crypto.randomUUID()

  const cookieStore = await cookies()
  cookieStore.set('sv_profile', profile.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  cookieStore.set('sv_session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  const supabase = createServerSupabase()
  await supabase.from('onboarding_responses').insert({
    session_id: sessionId,
    answers: Object.entries(answersMap).map(([q, choice]) => ({ q: Number(q), choice })),
    computed_profile: profile.id,
    axes_scores: axesScores,
  })

  redirect('/onboarding/result')
}
