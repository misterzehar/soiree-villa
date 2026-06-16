import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from './_lib/auth'
import { publishExperience } from './actions'

export const dynamic = 'force-dynamic'

type RegistrationRow = {
  id: string
  participant_first_name: string
  participant_last_name: string
  participant_email: string
  participant_profile_id: string
  tier_id: string
  payment_status: string
  amount_paid_cents: number | null
  platform_fee_cents: number | null
  stripe_session_id: string | null
  created_at: string
  experiences: { title: string; date: string } | null
}

type DraftExperience = {
  id: string
  title: string
  date: string
  venue_name: string
  organizer_name: string
  capacity_max: number
  created_at: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>
}) {
  const { token, status } = await searchParams

  const isAdmin = await checkAdminAccess(token)
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const supabase = createServerSupabase()
  const currentStatus = status === 'all' ? null : 'paid'

  // Badge counts + draft experiences in parallel
  const [
    { data: draftData },
    { count: pendingLieuxCount },
    { count: pendingFournsCount },
  ] = await Promise.all([
    supabase
      .from('experiences')
      .select('id, title, date, venue_name, organizer_name, capacity_max, created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: false }),
    supabase.from('lieux').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('fournisseurs').select('id', { count: 'exact', head: true }).eq('is_approved', false),
  ])

  // Registrations — conditional filter
  const regBase = supabase
    .from('registrations')
    .select('*, experiences(title, date)')
    .order('created_at', { ascending: false })
  const { data: registrationsRaw } = await (
    currentStatus === 'paid' ? regBase.eq('payment_status', 'paid') : regBase
  )

  const draftExps     = (draftData ?? []) as DraftExperience[]
  const registrations = (registrationsRaw ?? []) as RegistrationRow[]

  const totalRevenue = registrations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + (r.amount_paid_cents ?? 0), 0)

  // Build URL helpers that preserve token when present
  const q = token ? `?token=${token}` : ''
  const qAnd = token ? `?token=${token}&` : '?'

  const toolCards = [
    {
      href:        `/admin/matching${q}`,
      emoji:       '📊',
      title:       'Matching debug',
      description: '20 profils, 6 axes, scores par session',
      count:       undefined as number | undefined,
    },
    {
      href:        `/admin/lieux${q}`,
      emoji:       '🏠',
      title:       'Modération lieux',
      description: 'Valider ou rejeter les lieux en attente',
      count:       pendingLieuxCount ?? 0,
    },
    {
      href:        `/admin/fournisseurs${q}`,
      emoji:       '🎵',
      title:       'Modération fournisseurs',
      description: 'Valider ou rejeter les prestataires',
      count:       pendingFournsCount ?? 0,
    },
    {
      href:        `/admin/demandes${q}`,
      emoji:       '📨',
      title:       'Demandes orphelines',
      description: 'Briefs sans réponse depuis +7 jours',
      count:       0,
    },
    {
      href:        `/admin/avis${q}`,
      emoji:       '💬',
      title:       'Modération avis',
      description: 'Avis participants à valider',
      count:       0,
    },
  ]

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-text">Admin — Soirée Villa</h1>
            <p className="text-text-muted text-sm mt-0.5">
              {registrations.length} inscription{registrations.length > 1 ? 's' : ''}
              {currentStatus === 'paid' && ` payée${registrations.length > 1 ? 's' : ''}`}
              {' '}· {Math.round(totalRevenue / 100)} € CA brut
            </p>
          </div>
        </div>

        {/* ── Soirées en attente ─────────────────────────────────────── */}
        {draftExps.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-semibold text-lg text-text mb-3">
              ⏳ Soirées en attente de validation ({draftExps.length})
            </h2>
            <div className="flex flex-col gap-3">
              {draftExps.map(exp => (
                <div
                  key={exp.id}
                  className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm">{exp.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {exp.organizer_name} · {exp.venue_name} · {formatDate(exp.date)}
                    </p>
                    <p className="text-text-muted text-xs">
                      {exp.capacity_max} places · Soumis le {formatDate(exp.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/experiences/${exp.id}`}
                      className="text-xs px-3 py-1.5 border border-border rounded-lg text-text-muted hover:text-text transition-colors"
                    >
                      Voir
                    </Link>
                    <form action={publishExperience}>
                      <input type="hidden" name="adminToken" value={token ?? ''} />
                      <input type="hidden" name="experienceId" value={exp.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold"
                      >
                        ✓ Publier
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Outils admin ──────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-lg text-text mb-4">🛠️ Outils admin</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {toolCards.map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-surface border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/25 transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{card.emoji}</span>
                  {card.count !== undefined && (
                    <span className={[
                      'text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5',
                      card.count > 0 ? 'bg-error/10 text-error' : 'bg-border text-text-muted',
                    ].join(' ')}>
                      {card.count > 0 ? card.count : '—'}
                    </span>
                  )}
                </div>
                <p className="font-display font-semibold text-text text-sm leading-snug group-hover:text-primary transition-colors">
                  {card.title}
                </p>
                <p className="text-text-muted text-xs leading-snug">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Inscriptions ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-text">Inscriptions</h2>
            <div className="flex gap-2">
              <Link
                href={`/admin${qAnd}status=paid`}
                className={[
                  'text-sm px-3 py-1.5 rounded-full transition-colors',
                  currentStatus === 'paid'
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-muted hover:text-text',
                ].join(' ')}
              >
                Payées
              </Link>
              <Link
                href={`/admin${qAnd}status=all`}
                className={[
                  'text-sm px-3 py-1.5 rounded-full transition-colors',
                  currentStatus === null
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-muted hover:text-text',
                ].join(' ')}
              >
                Toutes
              </Link>
            </div>
          </div>

          {registrations.length === 0 ? (
            <p className="text-text-muted text-sm">Aucune inscription.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted bg-bg">
                    <th className="py-3 px-4 font-medium">Expérience</th>
                    <th className="py-3 px-4 font-medium">Date exp.</th>
                    <th className="py-3 px-4 font-medium">Participant</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Profil</th>
                    <th className="py-3 px-4 font-medium">Palier</th>
                    <th className="py-3 px-4 font-medium">Statut</th>
                    <th className="py-3 px-4 font-medium">Montant</th>
                    <th className="py-3 px-4 font-medium">Commission</th>
                    <th className="py-3 px-4 font-medium">Stripe</th>
                    <th className="py-3 px-4 font-medium">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-text max-w-[160px] truncate">
                        {r.experiences?.title ?? '—'}
                      </td>
                      <td className="py-2.5 px-4 text-text-muted whitespace-nowrap text-xs">
                        {r.experiences?.date ? formatDate(r.experiences.date) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-text whitespace-nowrap">
                        {r.participant_first_name} {r.participant_last_name}
                      </td>
                      <td className="py-2.5 px-4 text-text-muted text-xs">{r.participant_email}</td>
                      <td className="py-2.5 px-4 text-text-muted text-xs">{r.participant_profile_id}</td>
                      <td className="py-2.5 px-4 text-text-muted text-xs">{r.tier_id}</td>
                      <td className="py-2.5 px-4">
                        <span className={[
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          r.payment_status === 'paid'     ? 'bg-success/15 text-success' :
                          r.payment_status === 'failed'   ? 'bg-error/10 text-error'    :
                          r.payment_status === 'refunded' ? 'bg-warning/15 text-warning' :
                                                            'bg-border text-text-muted',
                        ].join(' ')}>
                          {r.payment_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-text whitespace-nowrap">
                        {r.amount_paid_cents != null ? `${Math.round(r.amount_paid_cents / 100)} €` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-text-muted text-xs whitespace-nowrap">
                        {r.platform_fee_cents != null ? `${Math.round(r.platform_fee_cents / 100)} €` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-text-muted text-xs font-mono">
                        {r.stripe_session_id ? `${r.stripe_session_id.slice(0, 18)}…` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-text-muted text-xs whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
