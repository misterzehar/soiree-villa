import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { PROFILES } from '@/constants/profiles'
import type { ProfileId } from '@/constants/profiles'
import type { Experience } from '@/types/experience'
import { ExperiencesList } from '@/components/experiences/experiences-list'
import { EmptyState } from '@/components/experiences/empty-state'

export const revalidate = 60

async function getExperiences(profileId: ProfileId | null): Promise<Experience[]> {
  const supabase = createServerSupabase()
  const now = new Date().toISOString()

  let query = supabase
    .from('experiences')
    .select('*')
    .eq('status', 'published')
    .gt('date', now)
    .order('date', { ascending: true })

  if (profileId) {
    query = query.contains('compatible_profiles', [profileId])
  }

  const { data } = await query
  return (data ?? []) as Experience[]
}

export default async function ExperiencesPage() {
  const cookieStore = await cookies()
  const profileId = cookieStore.get('sv_profile')?.value as ProfileId | null
  const profile = profileId ? PROFILES.find(p => p.id === profileId) ?? null : null

  const experiences = await getExperiences(profileId)

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <Link href="/" className="font-display font-bold text-lg text-text">
              Soirée Villa
            </Link>
            {profile && (
              <Link
                href="/onboarding/result"
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              >
                <span>{profile.emoji}</span>
                <span>{profile.name}</span>
              </Link>
            )}
          </div>

          {profile ? (
            <>
              <h1 className="font-display font-bold text-2xl text-text mt-4">
                Pour toi, {profile.name} {profile.emoji}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {experiences.length > 0
                  ? `${experiences.length} expérience${experiences.length > 1 ? 's' : ''} qui matche${experiences.length > 1 ? 'nt' : ''} ton style`
                  : 'Aucune expérience disponible pour ton profil pour le moment.'}
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

        {/* List or empty state */}
        {experiences.length > 0 ? (
          <ExperiencesList experiences={experiences} />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  )
}
