import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import type { Experience } from '@/types/experience'

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) + ' à ' + new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })
}

const TIER_LABELS: Record<string, string> = {
  early: 'Early bird',
  standard: 'Standard',
  last: 'Last chance',
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { id } = await params
  const { session_id } = await searchParams

  if (!session_id) notFound()

  const supabase = createServerSupabase()

  // Charge la registration via stripe_session_id (créée avant le redirect Stripe)
  const { data: reg } = await supabase
    .from('registrations')
    .select('*')
    .eq('stripe_session_id', session_id)
    .single()

  if (!reg) notFound()

  // Charge l'expérience
  const { data: exp } = await supabase
    .from('experiences')
    .select('title, date, venue_name, id')
    .eq('id', id)
    .single()

  if (!exp) notFound()

  const experience = exp as Pick<Experience, 'title' | 'date' | 'venue_name' | 'id'>
  const amountFmt = reg.amount_paid_cents
    ? `${Math.round(reg.amount_paid_cents / 100)} €`
    : '—'

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display font-bold text-3xl text-text mb-2">
            Ta place est confirmée !
          </h1>
          <p className="text-text-muted text-sm">
            Un email de confirmation a été envoyé à{' '}
            <span className="font-medium text-text">{reg.participant_email}</span>
          </p>
        </div>

        {/* Recap card */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-6 flex flex-col gap-4">

            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">
                Participant
              </p>
              <p className="text-text font-medium">
                {reg.participant_first_name} {reg.participant_last_name}
              </p>
            </div>

            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">
                Expérience
              </p>
              <p className="text-text font-medium">{experience.title}</p>
            </div>

            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="text-text capitalize">{formatDateLong(experience.date)}</p>
            </div>

            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">
                Lieu
              </p>
              <p className="text-text">{experience.venue_name}</p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">
                  Tarif payé
                </p>
                <p className="text-text text-sm">
                  {TIER_LABELS[reg.tier_id] ?? reg.tier_id}
                </p>
              </div>
              <p className="font-display font-bold text-2xl text-primary">{amountFmt}</p>
            </div>

          </div>
        </div>

        {/* CTAs */}
        <Link
          href="/experiences"
          className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-2xl shadow-md transition-colors duration-150 mb-3"
        >
          Voir d&apos;autres expériences
        </Link>
        <Link
          href={`/experiences/${experience.id}`}
          className="block w-full text-center text-text-muted text-sm py-2 hover:text-text transition-colors"
        >
          Retour à la fiche expérience
        </Link>

      </div>
    </main>
  )
}
