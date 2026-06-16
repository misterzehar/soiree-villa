import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from '../_lib/auth'
import { approveLieu, rejectLieu } from '../actions'
import type { Lieu } from '@/types/lieu'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminLieuxPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  const isAdmin = await checkAdminAccess(token)
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const supabase = createServerSupabase()

  const [{ data: pendingData }, { data: approvedData }] = await Promise.all([
    supabase.from('lieux').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
    supabase.from('lieux').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(30),
  ])

  const pending  = (pendingData ?? []) as Lieu[]
  const approved = (approvedData ?? []) as Lieu[]

  const backHref = token ? `/admin?token=${token}` : '/admin'

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">

        <Link href={backHref} className="text-text-muted text-xs hover:text-text transition-colors">
          ← Admin
        </Link>

        <div className="flex items-baseline justify-between mt-2 mb-6">
          <h1 className="font-display font-bold text-2xl text-text">🏠 Modération lieux</h1>
          <p className="text-text-muted text-sm">
            {pending.length} en attente · {approved.length} approuvés
          </p>
        </div>

        {/* En attente */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-base text-text mb-3">
            En attente de validation ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Aucun lieu en attente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map(lieu => (
                <div
                  key={lieu.id}
                  className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm">{lieu.name}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {lieu.lieu_type}
                      {lieu.city ? ` · ${lieu.city}` : ''}
                      {lieu.address ? ` · ${lieu.address}` : ''}
                      {lieu.capacity ? ` · ${lieu.capacity} pers.` : ''}
                    </p>
                    {lieu.ambiance && (
                      <p className="text-text-muted text-xs mt-0.5 italic">{lieu.ambiance}</p>
                    )}
                    {lieu.website_url && (
                      <a
                        href={lieu.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline mt-0.5 inline-block"
                      >
                        {lieu.website_url}
                      </a>
                    )}
                    <p className="text-text-muted text-xs mt-1">
                      Soumis le {formatDate(lieu.created_at)}
                      {lieu.claimed_by_user_id ? ' · Compte revendiqué' : ' · Sans compte'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveLieu}>
                      <input type="hidden" name="adminToken" value={token ?? ''} />
                      <input type="hidden" name="lieuId" value={lieu.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold"
                      >
                        ✓ Valider
                      </button>
                    </form>
                    <form action={rejectLieu}>
                      <input type="hidden" name="adminToken" value={token ?? ''} />
                      <input type="hidden" name="lieuId" value={lieu.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                      >
                        ✗ Rejeter
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approuvés */}
        {approved.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-base text-text mb-3">
              Lieux approuvés ({approved.length} derniers)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted bg-bg">
                    <th className="py-2.5 px-4 font-medium">Nom</th>
                    <th className="py-2.5 px-4 font-medium">Type</th>
                    <th className="py-2.5 px-4 font-medium">Ville</th>
                    <th className="py-2.5 px-4 font-medium">Capacité</th>
                    <th className="py-2.5 px-4 font-medium">Slug</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map(lieu => (
                    <tr key={lieu.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                      <td className="py-2 px-4 font-medium text-text text-xs">{lieu.name}</td>
                      <td className="py-2 px-4 text-text-muted text-xs">{lieu.lieu_type}</td>
                      <td className="py-2 px-4 text-text-muted text-xs">{lieu.city}</td>
                      <td className="py-2 px-4 text-text-muted text-xs">{lieu.capacity ?? '—'}</td>
                      <td className="py-2 px-4 text-text-muted text-xs font-mono">{lieu.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
