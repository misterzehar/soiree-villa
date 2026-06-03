import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'

type RegistrationRow = {
  id: string
  participant_first_name: string
  participant_last_name: string
  participant_email: string
  participant_profile_id: string
  tier_id: string
  payment_status: string
  amount_paid_cents: number | null
  stripe_session_id: string | null
  created_at: string
  experiences: { title: string; date: string } | null
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
  const registrations = await getRegistrations(currentStatus)

  const totalRevenue = registrations
    .filter(r => r.payment_status === 'paid' && r.amount_paid_cents)
    .reduce((sum, r) => sum + (r.amount_paid_cents ?? 0), 0)

  const baseUrl = `?token=${token}`

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-display font-bold text-2xl text-text">
            Admin — Inscriptions
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {registrations.length} inscription{registrations.length > 1 ? 's' : ''}
            {currentStatus === 'paid' && ` payée${registrations.length > 1 ? 's' : ''}`}
            {' '}· {Math.round(totalRevenue / 100)} € de revenus
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`${baseUrl}&status=paid`}
            className={[
              'text-sm px-3 py-1.5 rounded-full transition-colors',
              currentStatus === 'paid'
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            Payées seulement
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
                  <th className="py-3 px-4 font-medium">Session Stripe</th>
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
                      {r.amount_paid_cents != null
                        ? `${Math.round(r.amount_paid_cents / 100)} €`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-text-muted text-xs font-mono">
                      {r.stripe_session_id
                        ? `${r.stripe_session_id.slice(0, 18)}…`
                        : '—'}
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
      </div>
    </main>
  )
}
