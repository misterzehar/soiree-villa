import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { LogOut, MessageCircle, Sparkles, ArrowRight, Settings, User } from 'lucide-react'
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
import { FALLBACK_EXPERIENCE } from '@/lib/fallback-image'

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
    cover_image_url: string | null
  } | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDateKicker(dateStr: string): string {
  const d = new Date(dateStr)
  const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' })
    .replace(/\./g, '').toUpperCase()
  const day = d.getDate()
  const month = d.toLocaleDateString('fr-FR', { month: 'short' })
    .replace(/\./g, '').toUpperCase()
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    .replace(':', 'H')
  return `${weekday}. ${day} ${month}. · ${time}`
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export default async function ComptePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const serviceSupabase = createServerSupabase()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, social_profile_id, role, preferred_city')
    .eq('id', user.id)
    .single()

  const socialProfile = profile?.social_profile_id
    ? PROFILES.find(p => p.id === (profile.social_profile_id as ProfileId)) ?? null
    : null

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
  const isLegacyProfile = !!socialProfile && !hasNewProfile

  const now = new Date().toISOString()

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

  const { data: upcoming } = await serviceSupabase
    .from('registrations')
    .select('id, participant_first_name, tier_id, amount_paid_cents, payment_status, created_at, experiences(id, title, date, venue_name, cover_image_url)')
    .eq('participant_email', user.email!)
    .eq('payment_status', 'paid')
    .gt('experiences.date', now)
    .order('created_at', { ascending: false })

  const { data: past } = await serviceSupabase
    .from('registrations')
    .select('id, participant_first_name, tier_id, amount_paid_cents, payment_status, created_at, experiences(id, title, date, venue_name, cover_image_url)')
    .eq('participant_email', user.email!)
    .eq('payment_status', 'paid')
    .lte('experiences.date', now)
    .order('created_at', { ascending: false })
    .limit(5)

  const upcomingList = (upcoming ?? []) as unknown as Registration[]
  const pastList     = (past ?? []) as unknown as Registration[]

  const { data: badgesEarned } = await serviceSupabase
    .from('badges_earned')
    .select('badge_id')
    .eq('user_id', user.id)
  const earnedIds = new Set((badgesEarned ?? []).map(b => b.badge_id))

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

  const rawName = profile?.display_name ?? user.email ?? 'toi'
  const firstName = rawName.split(' ')[0].split('@')[0]

  return (
    <main className="min-h-screen bg-bg px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">

        {/* ════════════════════════════════════════
            HERO PERSONNEL
        ════════════════════════════════════════ */}
        <section className="mb-24">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-6">
            Ton carnet
          </p>

          <h1
            className="font-display font-light text-text leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            Bonjour {firstName}.
          </h1>

          <p className="text-text-muted text-lg mt-3">
            Membre depuis {formatMemberSince(user.created_at)}
          </p>

          {isLegacyProfile && (
            <Link
              href="/onboarding"
              className="mt-5 inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm transition-colors duration-200"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Affine ton profil — 2 nouveaux axes disponibles
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="w-16 h-px bg-gold mt-8" />
        </section>

        {/* ════════════════════════════════════════
            L'AGENDA — soirées à venir
        ════════════════════════════════════════ */}
        <section className="mb-20">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            L&apos;agenda
          </p>
          <h2
            className="font-display font-light text-text mb-12"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Tes prochaines soirées
          </h2>

          {upcomingList.length === 0 ? (
            <div className="flex flex-col items-start gap-7">
              <p className="text-text-muted text-lg italic leading-relaxed max-w-[44ch]">
                Ton agenda est vierge. Le prochain acte t&apos;attend.
              </p>
              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 border border-gold/60 text-gold text-sm font-medium tracking-[0.15em] uppercase px-6 py-3.5 hover:bg-gold/10 hover:border-gold focus-visible:border-gold focus-visible:outline-none transition-colors duration-300"
              >
                Explorer les soirées
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingList.map(reg => reg.experiences && (
                <article key={reg.id} className="flex flex-col bg-surface">

                  {/* Photo cover */}
                  <div className="relative aspect-video overflow-hidden border-b border-border/50">
                    <Image
                      src={reg.experiences.cover_image_url ?? FALLBACK_EXPERIENCE}
                      alt={reg.experiences.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 p-6">

                    {/* Kicker date */}
                    <p className="text-gold text-[10px] font-medium tracking-[0.35em] uppercase mb-3">
                      {formatDateKicker(reg.experiences.date)}
                    </p>

                    {/* Titre */}
                    <h3 className="font-display font-medium text-text text-xl leading-snug mb-2">
                      {reg.experiences.title}
                    </h3>

                    {/* Lieu */}
                    <p className="text-text-muted text-sm mb-auto">
                      {reg.experiences.venue_name}
                    </p>

                    {/* Footer carte */}
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/40">
                      <div className="flex items-center gap-4">
                        <span className="text-gold text-[10px] font-medium tracking-[0.2em] uppercase">
                          Confirmé
                        </span>
                        {(unreadByExp[reg.experiences.id] ?? 0) > 0 && (
                          <Link
                            href={`/chat/${reg.experiences.id}`}
                            className="flex items-center gap-1 text-text-muted hover:text-gold text-xs transition-colors duration-200"
                            aria-label={`${unreadByExp[reg.experiences.id]} messages non lus`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-gold font-medium">{unreadByExp[reg.experiences.id]}</span>
                          </Link>
                        )}
                      </div>
                      <Link
                        href={`/experiences/${reg.experiences.id}`}
                        className="inline-flex items-center gap-1.5 text-gold text-[11px] font-medium tracking-[0.15em] uppercase hover:gap-2.5 transition-all duration-200"
                      >
                        Voir détail
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Ornement ✦ */}
        <div className="flex items-center justify-center gap-4 my-16" aria-hidden="true">
          <div className="w-24 h-px bg-gold/20" />
          <span className="text-gold/40 text-xs tracking-[0.5em]">✦</span>
          <div className="w-24 h-px bg-gold/20" />
        </div>

        {/* ════════════════════════════════════════
            LES SOUVENIRS — historique timeline
        ════════════════════════════════════════ */}
        <section className="mb-20">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            Les souvenirs
          </p>
          <h2
            className="font-display font-light text-text mb-12"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Ce que tu as vécu
          </h2>

          {pastList.length === 0 ? (
            <p className="text-text-muted text-lg italic">
              Tes premiers souvenirs commencent bientôt.
            </p>
          ) : (
            <div className="relative pl-6">
              {/* Ligne verticale dorée */}
              <div
                className="absolute left-0 top-1.5 bottom-1.5 w-px bg-gold/20"
                aria-hidden="true"
              />
              {pastList.map(reg => reg.experiences && (
                <div key={reg.id} className="relative pb-10 last:pb-0">
                  {/* Dot sur la ligne */}
                  <div
                    className="absolute w-2 h-2 rounded-full bg-gold/50 border border-gold/70"
                    style={{ left: '-4px', top: '5px' }}
                    aria-hidden="true"
                  />
                  {/* Contenu */}
                  <p className="text-gold/60 text-[10px] font-medium tracking-[0.3em] uppercase mb-1.5 capitalize">
                    {formatDate(reg.experiences.date)}
                  </p>
                  <p className="font-display font-light text-text text-xl leading-snug">
                    {reg.experiences.title}
                  </p>
                  <p className="text-text-muted text-sm mt-1">{reg.experiences.venue_name}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ornement ✦ */}
        <div className="flex items-center justify-center gap-4 my-16" aria-hidden="true">
          <div className="w-24 h-px bg-gold/20" />
          <span className="text-gold/40 text-xs tracking-[0.5em]">✦</span>
          <div className="w-24 h-px bg-gold/20" />
        </div>

        {/* ════════════════════════════════════════
            TES BADGES
        ════════════════════════════════════════ */}
        <section className="mb-20">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            La collection
          </p>
          <h2
            className="font-display font-light text-text mb-12"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Tes badges
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {BADGES.map(badge => {
              const earned = earnedIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-2 text-center py-2 transition-opacity duration-300 ${earned ? 'opacity-100' : 'opacity-25'}`}
                  title={earned ? badge.desc : `À débloquer : ${badge.label}`}
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <p className="text-text-muted text-[10px] font-medium tracking-[0.1em] uppercase leading-snug">
                    {badge.label}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════
            MES TIER LISTS
        ════════════════════════════════════════ */}
        <section className="mb-20">

          <div className="flex items-baseline justify-between mb-4">
            <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase">
              Le classement
            </p>
            <Link
              href="/tier-list/mienne"
              className="text-text-muted text-xs hover:text-gold transition-colors duration-200"
            >
              Tout éditer →
            </Link>
          </div>

          <h2
            className="font-display font-light text-text mb-10"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Mes tier lists
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.keys(TIER_CATEGORY_LABELS) as TierCategory[]).map(cat => {
              const count = tierListMap[cat] ?? 0
              return (
                <Link
                  key={cat}
                  href={`/tier-list/mienne?cat=${cat}`}
                  className="group border border-border/40 hover:border-gold/40 p-5 transition-colors duration-300"
                >
                  <p className="font-display font-light text-text text-base group-hover:text-gold transition-colors duration-300 leading-snug mb-2">
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

        {/* Ornement ✦ */}
        <div className="flex items-center justify-center gap-4 my-16" aria-hidden="true">
          <div className="w-24 h-px bg-gold/20" />
          <span className="text-gold/40 text-xs tracking-[0.5em]">✦</span>
          <div className="w-24 h-px bg-gold/20" />
        </div>

        {/* ════════════════════════════════════════
            TA SIGNATURE — profil social + soirées pour toi
        ════════════════════════════════════════ */}
        <section className="mb-20">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            Ta signature
          </p>

          {socialProfile ? (
            <>
              <h2
                className="font-display font-light text-text leading-[1.05] tracking-[-0.02em] mb-4"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
              >
                <span className="mr-3" aria-hidden="true">{socialProfile.emoji}</span>
                {socialProfile.name}
              </h2>

              <p className="text-text-muted text-lg leading-relaxed max-w-[52ch] mb-10">
                {socialProfile.tagline}
              </p>

              {/* Top expériences si axes disponibles */}
              {topExperiences.length > 0 && (
                <div className="mb-10">
                  <p className="text-text-muted text-sm mb-5">Sélection pour toi :</p>
                  <div className="flex flex-col">
                    {topExperiences.map(({ exp, score }) => (
                      <Link
                        key={exp.id}
                        href={`/experiences/${exp.id}`}
                        className="group flex items-center gap-4 py-4 border-b border-border/30 hover:border-gold/30 transition-colors duration-300"
                      >
                        <span className="text-gold text-[10px] font-medium tracking-[0.1em] w-8 shrink-0 text-center">
                          {score}%
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-light text-text text-base leading-snug group-hover:text-gold transition-colors duration-300 truncate">
                            {exp.title}
                          </p>
                          <p className="text-text-muted text-xs capitalize mt-0.5">
                            {new Date(exp.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6">
                <Link
                  href="/onboarding/result"
                  className="text-text-muted text-sm hover:text-gold transition-colors duration-200"
                >
                  Voir mon profil complet →
                </Link>
                <Link
                  href="/onboarding"
                  className="text-text-muted text-sm hover:text-gold transition-colors duration-200"
                >
                  Refaire le quiz →
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2
                className="font-display font-light text-text mb-4"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
              >
                Ton profil social
              </h2>
              <p className="text-text-muted text-lg italic mb-8 max-w-[44ch]">
                Découvre ton style social en 3 minutes — et trouve tes soirées idéales.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 border border-gold/60 text-gold text-sm font-medium tracking-[0.15em] uppercase px-6 py-3.5 hover:bg-gold/10 hover:border-gold focus-visible:border-gold focus-visible:outline-none transition-colors duration-300"
              >
                Découvrir mon profil
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </section>

        {/* Ornement ✦ */}
        <div className="flex items-center justify-center gap-4 my-16" aria-hidden="true">
          <div className="w-24 h-px bg-gold/20" />
          <span className="text-gold/40 text-xs tracking-[0.5em]">✦</span>
          <div className="w-24 h-px bg-gold/20" />
        </div>

        {/* ════════════════════════════════════════
            RÉGLAGES
        ════════════════════════════════════════ */}
        <section className="mb-24">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-8">
            Réglages
          </p>

          <div className="flex flex-col">

            {/* Email */}
            <div className="flex items-center gap-4 py-5 border-b border-border/40">
              <User className="w-4 h-4 text-text-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-text-muted text-[10px] font-medium tracking-[0.2em] uppercase mb-0.5">
                  Email
                </p>
                <p className="text-text text-sm truncate">{user.email}</p>
              </div>
            </div>

            {/* Ville préférée */}
            <div className="py-5 border-b border-border/40">
              <form action={updatePreferredCity} className="flex items-center gap-4">
                <Settings className="w-4 h-4 text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
                    Ville préférée
                  </p>
                  <select
                    name="city"
                    defaultValue={profile?.preferred_city ?? ''}
                    className="w-full text-sm bg-transparent border-b border-border/40 focus:border-gold pb-1.5 text-text focus:outline-none transition-colors duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Choisir…</option>
                    {SUPPORTED_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="shrink-0 text-text-muted text-xs hover:text-gold transition-colors duration-200 py-1 px-2"
                >
                  Sauvegarder
                </button>
              </form>
            </div>

            {/* Se déconnecter */}
            <form action={signOut}>
              <button
                type="submit"
                className="group flex items-center gap-4 w-full py-5 text-left text-text-muted hover:text-gold transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-sm flex-1">Se déconnecter</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            </form>

          </div>
        </section>

        {/* ════════════════════════════════════════
            FOOTER PERSONNEL
        ════════════════════════════════════════ */}
        <footer className="text-center pb-8">
          <p className="text-text-muted text-sm italic">Bienvenue dans le cercle.</p>
        </footer>

      </div>
    </main>
  )
}
