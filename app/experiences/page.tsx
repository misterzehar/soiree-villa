import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { PROFILES } from '@/constants/profiles'
import { matchScore, deriveExperienceAxes } from '@/lib/matching'
import type { ProfileId, AxesTarget } from '@/constants/profiles'
import type { Experience } from '@/types/experience'
import { ExperiencesList } from '@/components/experiences/experiences-list'
import { EmptyState } from '@/components/experiences/empty-state'
import { SiteHeader } from '@/components/site-header'
import { CityWaitlistForm } from '@/components/city-waitlist-form'
import { getCity } from '@/lib/city'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Soirées',
  description: 'Toutes les expériences sociales animées disponibles près de chez toi. Matchées pour ton profil.',
  openGraph: {
    title: 'Les soirées — Soirée Villa',
    description: 'Des expériences animées, matchées pour ton style social.',
  },
}

export default async function ExperiencesPage() {
  const cookieStore = await cookies()
  const profileId = cookieStore.get('sv_profile')?.value as ProfileId | null
  const city = getCity(cookieStore)

  // Parse user's 6D normalized axes from cookie (set by Phase 7 onboarding)
  let userAxes: AxesTarget | null = null
  const axesCookieRaw = cookieStore.get('sv_axes')?.value
  if (axesCookieRaw) {
    try {
      const parsed = JSON.parse(axesCookieRaw)
      if ('energy' in parsed) userAxes = parsed as AxesTarget
    } catch { /* ignore */ }
  }

  const profile = profileId ? PROFILES.find(p => p.id === profileId) ?? null : null

  // Fetch published future experiences filtered by city
  const supabase = createServerSupabase()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'published')
    .eq('city', city)
    .gt('date', now)
    .order('date', { ascending: true })

  let experiences = (data ?? []) as Experience[]

  // Compute match scores and sort descending when user has 6D axes
  const matchScores: Record<string, number> = {}
  if (userAxes) {
    for (const exp of experiences) {
      // Override: if user's profileId is in compatible_profiles → perfect match
      if (profileId && exp.compatible_profiles.includes(profileId)) {
        matchScores[exp.id] = 100
      } else {
        const expAxes = deriveExperienceAxes(exp.compatible_profiles)
        matchScores[exp.id] = matchScore(userAxes, expAxes)
      }
    }
    experiences = [...experiences].sort((a, b) => (matchScores[b.id] ?? 0) - (matchScores[a.id] ?? 0))
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="mb-6">
          <SiteHeader
            center={profile ? (
              <div className="flex justify-end">
                <Link
                  href="/onboarding/result"
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>{profile.emoji}</span>
                  <span className="hidden sm:inline">{profile.name}</span>
                </Link>
              </div>
            ) : undefined}
          />

          {profile ? (
            <>
              <h1 className="font-display font-bold text-2xl text-text mt-4">
                Pour toi, {profile.name} {profile.emoji}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {experiences.length > 0
                  ? userAxes
                    ? `${experiences.length} expérience${experiences.length > 1 ? 's' : ''} — triée${experiences.length > 1 ? 's' : ''} par affinité`
                    : `${experiences.length} expérience${experiences.length > 1 ? 's' : ''} qui matche${experiences.length > 1 ? 'nt' : ''} ton style`
                  : 'Aucune expérience disponible pour le moment.'}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl text-text mt-4">
                Les expériences
              </h1>
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                <p className="text-text text-sm">
                  <Link href="/onboarding" className="text-primary font-semibold hover:underline">
                    Fais le quiz →
                  </Link>{' '}
                  pour voir les expériences qui matchent vraiment ton style.
                </p>
              </div>
            </>
          )}
        </div>

        {experiences.length > 0 ? (
          <ExperiencesList
            experiences={experiences}
            matchScores={userAxes ? matchScores : undefined}
          />
        ) : (
          <div className="bg-surface rounded-2xl p-6 text-center border border-border">
            <p className="text-3xl mb-3">🌇</p>
            <p className="font-display font-semibold text-text mb-1">Bientôt à {city} !</p>
            <p className="text-text-muted text-sm mb-5">
              Pas encore d&apos;expériences dans ta ville. Laisse ton email pour être prévenu·e en premier.
            </p>
            <CityWaitlistForm city={city} />
          </div>
        )}
      </div>
    </main>
  )
}
