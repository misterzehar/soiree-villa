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
  created_at: string
  experiences: { title: string } | null
}

async function getRegistrations(): Promise<RegistrationRow[]> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('registrations')
    .select('*, experiences(title)')
    .order('created_at', { ascending: false })
  return (data ?? []) as RegistrationRow[]
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const registrations = await getRegistrations()

  return (
    <main className="min-h-screen bg-bg p-6">
      <h1 className="font-display font-bold text-2xl text-text mb-1">
        Admin — Inscriptions
      </h1>
      <p className="text-text-muted text-sm mb-6">
        {registrations.length} inscription{registrations.length > 1 ? 's' : ''} au total
      </p>

      {registrations.length === 0 ? (
        <p className="text-text-muted text-sm">Aucune inscription pour l&apos;instant.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 pr-4 font-medium">Expérience</th>
                <th className="pb-2 pr-4 font-medium">Nom</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Profil</th>
                <th className="pb-2 pr-4 font-medium">Palier</th>
                <th className="pb-2 pr-4 font-medium">Statut</th>
                <th className="pb-2 pr-4 font-medium">Montant</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-surface">
                  <td className="py-2 pr-4 text-text font-medium">
                    {r.experiences?.title ?? '—'}
                  </td>
                  <td className="py-2 pr-4 text-text">
                    {r.participant_first_name} {r.participant_last_name}
                  </td>
                  <td className="py-2 pr-4 text-text-muted">{r.participant_email}</td>
                  <td className="py-2 pr-4 text-text-muted">{r.participant_profile_id}</td>
                  <td className="py-2 pr-4 text-text-muted">{r.tier_id}</td>
                  <td className="py-2 pr-4">
                    <span className={[
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      r.payment_status === 'paid'    ? 'bg-success/15 text-success' :
                      r.payment_status === 'failed'  ? 'bg-error/10 text-error'   :
                      r.payment_status === 'refunded'? 'bg-warning/15 text-warning':
                                                       'bg-border text-text-muted',
                    ].join(' ')}>
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-text-muted">
                    {r.amount_paid_cents != null
                      ? `${Math.round(r.amount_paid_cents / 100)} €`
                      : '—'}
                  </td>
                  <td className="py-2 text-text-muted whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
