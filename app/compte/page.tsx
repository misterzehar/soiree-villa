import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, LogOut } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase'
import { PROFILES } from '@/constants/profiles'
import type { ProfileId } from '@/constants/profiles'
import { signOut } from '@/app/auth/actions'

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

  // Profil social
  const serviceSupabase = createServerSupabase()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('display_name, social_profile_id, role')
    .eq('id', user.id)
    .single()

  const socialProfile = profile?.social_profile_id
    ? PROFILES.find(p => p.id === profile.social_profile_id as ProfileId) ?? null
    : null

  const now = new Date().toISOString()

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
  const pastList = (past ?? []) as unknown as Registration[]

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
        </div>

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
                <Link
                  key={reg.id}
                  href={`/experiences/${reg.experiences.id}`}
                  className="bg-surface rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-display font-semibold text-text leading-snug">
                      {reg.experiences.title}
                    </p>
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
                  <span className="inline-block mt-2 text-xs bg-success/10 text-success font-medium px-2 py-0.5 rounded-full">
                    {TIER_LABELS[reg.tier_id] ?? reg.tier_id}
                  </span>
                </Link>
              ))}
            </div>
          )}
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
