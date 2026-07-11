import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
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
  early:    'Early bird',
  standard: 'Standard',
  last:     'Last chance',
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

  const { data: reg } = await supabase
    .from('registrations')
    .select('*')
    .eq('stripe_session_id', session_id)
    .single()

  if (!reg) notFound()

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
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-md">

        {/* Cercle check animé */}
        <div className="mx-auto mb-8 w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center animate-scale-in">
          <Check className="w-10 h-10 text-gold" strokeWidth={1.5} />
        </div>

        <p
          className="text-gold text-[10px] font-medium tracking-[0.5em] uppercase animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          Confirmé
        </p>

        <h1
          className="font-display font-light text-white mt-4 mb-6 animate-fade-in"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            animationDelay: '0.35s',
          }}
        >
          Ta place est réservée.
        </h1>

        <p
          className="text-white/60 text-lg mb-16 max-w-[42ch] mx-auto animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          On t&apos;a envoyé un email de confirmation à{' '}
          <span className="text-white/90">{reg.participant_email}</span>.
        </p>

        {/* Récap compact */}
        <div
          className="border-t border-white/10 pt-8 mb-12 text-left animate-fade-in"
          style={{ animationDelay: '0.65s' }}
        >

          <div className="mb-6">
            <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-2">Participant</p>
            <p className="font-display font-light text-white text-base">
              {reg.participant_first_name} {reg.participant_last_name}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-2">Expérience</p>
            <p className="font-display font-light text-white leading-snug" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
              {experience.title}
            </p>
            <p className="text-white/60 text-sm capitalize mt-1">
              {formatDateLong(experience.date)} · {experience.venue_name}
            </p>
          </div>

          <div className="border-t border-white/10 pt-6 flex items-center justify-between">
            <p className="text-white/50 text-sm">
              {TIER_LABELS[reg.tier_id] ?? reg.tier_id}
            </p>
            <p
              className="font-display font-light text-gold"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
            >
              {amountFmt}
            </p>
          </div>
        </div>

        {/* CTAs Ghost */}
        <div
          className="flex flex-col gap-4 animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          <Link
            href={`/experiences/${experience.id}`}
            className="block w-full text-center border border-gold/60 bg-transparent text-gold font-medium tracking-[0.15em] uppercase text-sm px-8 py-4 hover:bg-gold/10 hover:border-gold focus-visible:border-gold focus-visible:bg-gold/15 focus-visible:outline-none transition-colors duration-300"
          >
            Voir ma soirée{' '}
            <span aria-hidden="true" className="tracking-normal normal-case">→</span>
          </Link>
          <Link
            href="/experiences"
            className="block w-full text-center border border-white/15 text-white/60 font-medium tracking-[0.12em] uppercase text-sm px-8 py-4 hover:border-white/30 hover:text-white/80 focus-visible:outline-none transition-colors duration-300"
          >
            Explorer d&apos;autres soirées
          </Link>
        </div>

      </div>
    </main>
  )
}
