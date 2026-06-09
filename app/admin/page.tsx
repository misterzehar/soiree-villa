import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { publishExperience, approveLieu, rejectLieu, approveFournisseur, rejectFournisseur } from './actions'
import type { Lieu } from '@/types/lieu'
import type { Fournisseur } from '@/types/fournisseur'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'

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

async function getRegistrations(status: string | null): Promise<RegistrationRow[]> {
  const supabase = createServerSupabase()
  let query = supabase
    .from('registrations')
    .select('*, experiences(title, date)')
    .order('created_at', { ascending: false })

  if (status === 'paid') {
    query = query.eq('payment_status', 'paid')
  }

  const { data } = await query
  return (data ?? []) as RegistrationRow[]
}

async function getDraftExperiences(): Promise<DraftExperience[]> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('experiences')
    .select('id, title, date, venue_name, organizer_name, capacity_max, created_at')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
  return (data ?? []) as DraftExperience[]
}

async function getPendingLieux(): Promise<Lieu[]> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('lieux')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
  return (data ?? []) as Lieu[]
}

async function getPendingFournisseurs(): Promise<Fournisseur[]> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
  return (data ?? []) as Fournisseur[]
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

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const currentStatus = status === 'all' ? null : 'paid'
  const [registrations, draftExperiences, pendingLieux, pendingFournisseurs] = await Promise.all([
    getRegistrations(currentStatus),
    getDraftExperiences(),
    getPendingLieux(),
    getPendingFournisseurs(),
  ])

  const totalRevenue = registrations
    .filter(r => r.payment_status === 'paid' && r.amount_paid_cents)
    .reduce((sum, r) => sum + (r.amount_paid_cents ?? 0), 0)

  const baseUrl = `?token=${token}`

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-start justify-between mb-2">
          <h1 className="font-display font-bold text-2xl text-text">
            Admin — Soirée Villa
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {registrations.length} inscription{registrations.length > 1 ? 's' : ''}
            {currentStatus === 'paid' && ` payée${registrations.length > 1 ? 's' : ''}`}
            {' '}· {Math.round(totalRevenue / 100)} € de revenus
          </p>
        </div>

        {/* ── Soirées en attente de validation ──────────────────────────── */}
        {draftExperiences.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-semibold text-lg text-text mb-3">
              ⏳ Soirées en attente de validation ({draftExperiences.length})
            </h2>
            <div className="flex flex-col gap-3">
              {draftExperiences.map(exp => (
                <div
                  key={exp.id}
                  className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm">{exp.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {exp.organizer_name} · {exp.venue_name} · {formatDate(exp.date)}
                    </p>
                    <p className="text-text-muted text-xs">{exp.capacity_max} places max · Soumis le {formatDate(exp.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/experiences/${exp.id}`}
                      className="text-xs px-3 py-1.5 border border-border rounded-lg text-text-muted hover:text-text transition-colors"
                    >
                      Voir
                    </Link>
                    <form action={publishExperience}>
                      <input type="hidden" name="adminToken" value={token} />
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

        {/* ── Lieux en attente ──────────────────────────────────────────── */}
        {pendingLieux.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-semibold text-lg text-text mb-3">
              🏠 Lieux en attente ({pendingLieux.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingLieux.map(lieu => (
                <div
                  key={lieu.id}
                  className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm">{lieu.name}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {lieu.lieu_type} · {lieu.city}{lieu.address ? ` · ${lieu.address}` : ''}
                      {lieu.capacity ? ` · ${lieu.capacity} pers.` : ''}
                    </p>
                    <p className="text-text-muted text-xs">Soumis le {formatDate(lieu.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveLieu}>
                      <input type="hidden" name="adminToken" value={token} />
                      <input type="hidden" name="lieuId" value={lieu.id} />
                      <button type="submit" className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold">
                        ✓ Valider
                      </button>
                    </form>
                    <form action={rejectLieu}>
                      <input type="hidden" name="adminToken" value={token} />
                      <input type="hidden" name="lieuId" value={lieu.id} />
                      <button type="submit" className="text-xs px-3 py-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                        ✗ Rejeter
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Fournisseurs en attente ────────────────────────────────────── */}
        {pendingFournisseurs.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-semibold text-lg text-text mb-3">
              🎵 Fournisseurs en attente ({pendingFournisseurs.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingFournisseurs.map(f => (
                <div
                  key={f.id}
                  className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm">{f.name}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {FOURNISSEUR_CATEGORY_LABELS[f.category]} · {f.city}
                      {f.price_range ? ` · ${f.price_range}` : ''}
                    </p>
                    <p className="text-text-muted text-xs">Soumis le {formatDate(f.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveFournisseur}>
                      <input type="hidden" name="adminToken" value={token} />
                      <input type="hidden" name="fournisseurId" value={f.id} />
                      <button type="submit" className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold">
                        ✓ Valider
                      </button>
                    </form>
                    <form action={rejectFournisseur}>
                      <input type="hidden" name="adminToken" value={token} />
                      <input type="hidden" name="fournisseurId" value={f.id} />
                      <button type="submit" className="text-xs px-3 py-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                        ✗ Rejeter
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Inscriptions ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-text">Inscriptions</h2>
            <div className="flex gap-2">
              <Link
                href={`${baseUrl}&status=paid`}
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
                href={`${baseUrl}&status=all`}
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
