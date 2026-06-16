'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'

export async function submitNps(formData: FormData): Promise<void> {
  const registrationId = formData.get('registrationId') as string
  const scoreStr       = formData.get('score') as string
  const comment        = (formData.get('comment') as string | null)?.trim() || null

  const score = parseInt(scoreStr, 10)
  if (!registrationId || isNaN(score) || score < 0 || score > 10) {
    redirect(`/nps/${registrationId}?error=1`)
  }

  const supabase = createServerSupabase()

  const { data: reg } = await supabase
    .from('registrations')
    .select('id, payment_status')
    .eq('id', registrationId)
    .eq('payment_status', 'paid')
    .single()

  if (!reg) redirect(`/nps/${registrationId}?error=1`)

  const { data: existing } = await supabase
    .from('nps_responses')
    .select('id')
    .eq('registration_id', registrationId)
    .maybeSingle()

  if (!existing) {
    await supabase.from('nps_responses').insert({
      registration_id: registrationId,
      score,
      comment,
    })
  }

  redirect(`/nps/${registrationId}?merci=1`)
}
