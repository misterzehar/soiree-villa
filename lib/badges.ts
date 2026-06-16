import { createServerSupabase } from '@/lib/supabase'

export const BADGES = [
  {
    id:    'first_party',
    emoji: '🎉',
    label: 'Première soirée',
    desc:  'Tu as vécu ta 1ère expérience Soirée Villa.',
  },
  {
    id:    'socialite',
    emoji: '✨',
    label: 'Socialite',
    desc:  '3 expériences vécues — tu es dans le bain.',
  },
  {
    id:    'legend',
    emoji: '🏆',
    label: 'Légende',
    desc:  '10 expériences vécues. Respect.',
  },
  {
    id:    'early_bird',
    emoji: '🐦',
    label: 'Early Bird',
    desc:  'Inscrit en tarif Early Bird — tu as du flair.',
  },
  {
    id:    'loyal',
    emoji: '💛',
    label: 'Fidèle',
    desc:  '3 soirées avec le même organisateur.',
  },
  {
    id:    'connector',
    emoji: '🔗',
    label: 'Connecteur',
    desc:  'Tu as invité un ami. (Disponible V1.5)',
    locked: true,
  },
] as const

export type BadgeId = typeof BADGES[number]['id']

export async function checkAndAwardBadges(
  userId: string,
  participantEmail: string,
  tierId: string,
  experienceId: string,
) {
  const supabase = createServerSupabase()

  // Count all paid registrations for this user (by email)
  const { count: totalPaid } = await supabase
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('participant_email', participantEmail)
    .eq('payment_status', 'paid')

  const total = totalPaid ?? 0

  // Count paid registrations for the same organizer
  const { data: sameOrgRegs } = await supabase
    .from('registrations')
    .select('experiences(organizer_name)')
    .eq('participant_email', participantEmail)
    .eq('payment_status', 'paid')

  const currentOrg = await (async () => {
    const { data: exp } = await supabase
      .from('experiences')
      .select('organizer_name')
      .eq('id', experienceId)
      .single()
    return exp?.organizer_name ?? null
  })()

  const sameOrgCount = currentOrg
    ? (sameOrgRegs ?? []).filter(r => {
        const exp = Array.isArray(r.experiences) ? r.experiences[0] : r.experiences
        return (exp as { organizer_name: string } | null)?.organizer_name === currentOrg
      }).length
    : 0

  const toAward: BadgeId[] = []
  if (total >= 1)  toAward.push('first_party')
  if (total >= 3)  toAward.push('socialite')
  if (total >= 10) toAward.push('legend')
  if (tierId === 'early') toAward.push('early_bird')
  if (sameOrgCount >= 3)  toAward.push('loyal')

  for (const badgeId of toAward) {
    await supabase
      .from('badges_earned')
      .upsert(
        { user_id: userId, badge_id: badgeId, earned_at: new Date().toISOString() },
        { onConflict: 'user_id,badge_id', ignoreDuplicates: true },
      )
  }
}
