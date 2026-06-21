import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Calendar, MapPin, LogOut, MessageCircle, Sparkles } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase'
import { PROFILES } from '@/constants/profiles'
import { matchScore, deriveExperienceAxes } from '@/lib/matching'
import type { ProfileId, AxesTarget } from '@/constants/profiles'
import type { Experience } from '@/types/experience'
import { signOut } from '@/app/auth/actions'
import { BADGES } from '@/lib/badges'
import { SUPPORTED_CITIES } from '@/constants/cities'
import { TIER_CATEGORY_LABELS, type TierCategory } from '@/lib/community-tier'
import { updatePreferredCity } from './actions'

type Registration = {
  id: string
  participant_first_name: string
  tier_id: string
  amount_paid_cents: number | null
  payment_status: string
  created_at: string
  experiences: {
    id: string
    title: string
    date: string
    venue_name: string
  } | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const TIER_LABELS: Record<string, string> = {
  early: 'Early bird',
  standard: 'Standard',
  last: 'Last chance',
}

export default async function ComptePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  // Profil social + données compte
  const serviceSupabase = createServerSupabase()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, social_profile_id, role, preferred_city')
    .eq('id', user.id)
    .single()

  const socialProfile = profile?.social_profile_id
    ? PROFILES.find(p => p.id === (profile.social_profile_id as ProfileId)) ?? null
    : null

  // Parse user axes from cookie (6D — only present after new onboarding)
  const cookieStore = await cookies()
  let userAxes: AxesTarget | null = null
  let hasNewProfile = false

  const axesCookieRaw = cookieStore.get('sv_axes')?.value
  if (axesCookieRaw) {
    try {
      const parsed = JSON.parse(axesCookieRaw)
      if ('cerebrale' in parsed) {
        userAxes = parsed as AxesTarget
        hasNewProfile = true
      }
    } catch { /* ignore */ }
  }

  const profileId = cookieStore.get('sv_profile')?.value as ProfileId | null

  // Migration banner: user has a social profile but hasn't done the 6D onboarding
  const isLegacyProfile = !!socialProfile && !hasNewProfile

  const now = new Date().toISOString()

  // "Soirées pour toi" — top 3 when user has 6D axes
  let topExperiences: Array<{ exp: Experience; score: number }> = []
  if (userAxes) {
    const { data: expData } = await serviceSupabase
      .from('experiences')
      .select('*')
      .eq('status', 'published')
      .gt('date', now)
      .order('date', { ascending: true })
      .limit(30)

    const allExps = (expData ?? []) as Experience[]
    topExperiences = allExps
      .map(exp => ({
        exp,
        score: profileId && exp.compatible_profiles.includes(profileId)
          ? 100
          : matchScore(userAxes!, deriveExperienceAxes(exp.compatible_profiles)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  // Inscriptions à venir
  const { data: upcoming } = await serviceSupabase
    .from('registrations')
    .select('id, participant_first_name, tier_id, amount_paid_cents, payment_status, created_at, experiences(id, title, date, venue_name)')
    .eq('participant_email', user.email!)
    .eq('payment_status', 'paid')
    .gt('experiences.date', now)
    .order('created_at', { ascending: false })

  // Historique passées
  const { data: past } = await serviceSupabase
    .from('registrations')
    .select('id, participant_first_name, tier_id, amount_paid_cents, payment_status, created_at, experiences(id, title, date, venue_name)')
    .eq('participant_email', user.email!)
    .eq('payment_status', 'paid')
    .lte('experiences.date', now)
    .order('created_at', { ascending: false })
    .limit(5)

  const upcomingList = (upcoming ?? []) as unknown as Registration[]
  const pastList     = (past ?? []) as unknown as Registration[]

  // Badges earned
  const { data: badgesEarned } = await serviceSupabase
    .from('badges_earned')
    .select('badge_id')
    .eq('user_id', user.id)
  const earnedIds = new Set((badgesEarned ?? []).map(b => b.badge_id))

  // Tier lists progress
  const { data: tierListsRaw } = await serviceSupabase
    .from('user_tier_lists')
    .select('category, items_by_tier')
    .eq('user_id', user.id)

  type TierListRow = { category: string; items_by_tier: Record<string, string[]> }
  const tierListMap: Record<string, number> = {}
  for (const row of (tierListsRaw ?? []) as TierListRow[]) {
    const count = Object.values(row.items_by_tier).flat().length
    tierListMap[row.category] = count
  }

  // Unread message badges
  const expIds = upcomingList.filter(r => r.experiences).map(r => r.experiences!.id)
  const unreadByExp: Record<string, number> = {}

  if (expIds.length > 0) {
    const { data: convRows } = await serviceSupabase
      .from('conversations')
      .select('id, experience_id')
      .in('experience_id', expIds)

    const convIds = (convRows ?? []).map(c => c.id)
    const readMap: Record<string, string> = {}

    if (convIds.length > 0) {
      const { data: readRowsData } = await serviceSupabase
        .from('message_reads')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id)
        .in('conversation_id', convIds)
      for (const r of readRowsData ?? []) readMap[r.conversation_id] = r.last_read_at
    }

    await Promise.all(
      (convRows ?? []).map(async (conv) => {
        const lastRead = readMap[conv.id] ?? '1970-01-01T00:00:00Z'
        const { count } = await serviceSupabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .is('deleted_at', null)
          .gt('created_at', lastRead)
        unreadByExp[conv.experience_id] = count ?? 0
      }),
    )
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-8 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="font-display font-bold text-lg text-text">
            Soirée Villa
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </form>
        </div>

        {/* Profil utilisateur */}
        <div className="bg-surface rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
              {(profile?.display_name ?? user.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-text truncate">
                {profile?.display_name ?? user.email}
              </p>
              <p className="text-text-muted text-xs">{user.email}</p>
            </div>
          </div>

          {socialProfile && (
            <Link
              href="/onboarding/result"
              className="mt-4 flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 hover:bg-primary/10 transition-colors"
            >
              <span className="text-2xl">{socialProfile.emoji}</span>
              <div>
                <p className="font-medium text-text text-sm">{socialProfile.name}</p>
                <p className="text-text-muted text-xs">{socialProfile.tagline.slice(0, 55)}…</p>
              </div>
            </Link>
          )}

          {!socialProfile && (
            <Link
              href="/onboarding"
              className="mt-4 block text-center text-sm text-primary border border-primary/20 rounded-xl py-2.5 hover:bg-primary/5 transition-colors"
            >
              Découvrir mon profil social →
            </Link>
          )}

          {/* Ville préférée */}
          <form action={updatePreferredCity} className="mt-4 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-text-muted shrink-0" />
            <select
              name="city"
              defaultValue={profile?.preferred_city ?? ''}
              className="flex-1 text-sm bg-bg border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
            >
              <option value="">Ma ville préférée…</option>
              {SUPPORTED_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="shrink-0 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors"
            >
              Sauvegarder
            </button>
          </form>

          {/* Migration banner */}
          {isLegacyProfile && (
            <Link
              href="/onboarding"
              className="mt-3 flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 hover:bg-warning/10 transition-colors"
            >
              <Sparkles className="w-5 h-5 text-warning shrink-0" />
              <div>
                <p className="text-warning text-xs font-semibold">Affine ton profil</p>
                <p className="text-text-muted text-xs">On a ajouté 2 nouveaux axes — refais le quiz pour des matchs encore plus précis.</p>
              </div>
            </Link>
          )}
        </div>

        {/* Soirées pour toi — top 3 */}
        {topExperiences.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display font-semibold text-lg text-text mb-3">
              Soirées pour toi
            </h2>
            <div className="flex flex-col gap-3">
              {topExperiences.map(({ exp, score }) => (
                <Link
                  key={exp.id}
                  href={`/experiences/${exp.id}`}
                  className="bg-surface rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{score}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-text text-sm truncate">{exp.title}</p>
                    <p className="text-text-muted text-xs capitalize">
                      {new Date(exp.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {exp.venue_name}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/experiences"
                className="text-center text-primary text-sm font-medium py-2 hover:underline"
              >
                Voir toutes les expériences →
              </Link>
            </div>
          </section>
        )}

        {/* Soirées à venir */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            Mes prochaines soirées
          </h2>
          {upcomingList.length === 0 ? (
            <div className="bg-surface rounded-2xl p-5 text-center">
              <p className="text-text-muted text-sm mb-3">Aucune soirée à venir.</p>
              <Link
                href="/experiences"
                className="inline-block bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Voir les expériences
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingList.map(reg => reg.experiences && (
                <div
                  key={reg.id}
                  className="bg-surface rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      href={`/experiences/${reg.experiences.id}`}
                      className="font-display font-semibold text-text leading-snug hover:text-primary transition-colors flex-1"
                    >
                      {reg.experiences.title}
                    </Link>
                    <span className="text-primary font-semibold text-sm shrink-0">
                      {reg.amount_paid_cents != null ? `${Math.round(reg.amount_paid_cents / 100)} €` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="capitalize">{formatDate(reg.experiences.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted text-xs">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{reg.experiences.venue_name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs bg-success/10 text-success font-medium px-2 py-0.5 rounded-full">
                      {TIER_LABELS[reg.tier_id] ?? reg.tier_id}
                    </span>
                    <Link
                      href={`/chat/${reg.experiences.id}`}
                      className="relative flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                      {(unreadByExp[reg.experiences.id] ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                          {unreadByExp[reg.experiences.id]}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Badges */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            Mes badges
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(badge => {
              const earned = earnedIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  className={`bg-surface rounded-2xl p-4 flex flex-col items-center gap-1 text-center transition-opacity ${earned ? 'opacity-100 shadow-sm' : 'opacity-40'}`}
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <p className="font-display font-semibold text-text text-xs leading-snug">{badge.label}</p>
                  {earned && (
                    <p className="text-text-muted text-[10px] leading-snug">{badge.desc}</p>
                  )}
                  {!earned && (
                    <p className="text-text-muted text-[10px]">À débloquer</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Mes tier lists */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-text">Mes tier lists</h2>
            <Link href="/tier-list/mienne" className="text-primary text-sm font-semibold hover:underline">
              Éditer →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(TIER_CATEGORY_LABELS) as TierCategory[]).map(cat => {
              const count = tierListMap[cat] ?? 0
              return (
                <Link
                  key={cat}
                  href={`/tier-list/mienne?cat=${cat}`}
                  className="bg-surface rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <p className="font-display font-semibold text-text text-sm group-hover:text-primary transition-colors leading-snug mb-1">
                    {TIER_CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-text-muted text-xs">
                    {count > 0 ? `${count} classé${count > 1 ? 's' : ''}` : 'Non commencé'}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Historique */}
        {pastList.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-lg text-text mb-3">
              Soirées passées
            </h2>
            <div className="flex flex-col gap-3">
              {pastList.map(reg => reg.experiences && (
                <div key={reg.id} className="bg-surface rounded-2xl p-4 opacity-70">
                  <p className="font-display font-medium text-text text-sm mb-1">
                    {reg.experiences.title}
                  </p>
                  <p className="text-text-muted text-xs capitalize">
                    {formatDate(reg.experiences.date)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
