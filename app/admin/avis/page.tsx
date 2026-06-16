import Link from 'next/link'
import { Star } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from '../_lib/auth'
import { publishReview, rejectReview } from './actions'
import type { Review } from '@/types/review'

export const dynamic = 'force-dynamic'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function StarRow({ rating }: { rating: number }) {
  return <span>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export default async function AdminAvisPage({
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

  const [{ data: pendingData }, { data: publishedData }] = await Promise.all([
    supabase.from('reviews').select('*').eq('is_published', false).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(20),
  ])

  const pending   = (pendingData ?? []) as Review[]
  const published = (publishedData ?? []) as Review[]

  const backHref = token ? `/admin?token=${token}` : '/admin'

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">

        <Link href={backHref} className="text-text-muted text-xs hover:text-text transition-colors">
          ← Admin
        </Link>

        <div className="flex items-baseline justify-between mt-2 mb-6">
          <h1 className="font-display font-bold text-2xl text-text">💬 Modération avis</h1>
          <p className="text-text-muted text-sm">
            {pending.length} en attente · {published.length} publiés
          </p>
        </div>

        {/* En attente */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-base text-text mb-3">
            En attente de modération ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Aucun avis en attente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map(r => (
                <div
                  key={r.id}
                  className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text text-sm">{r.author_name}</span>
                      <span className="text-warning text-sm"><StarRow rating={r.rating} /></span>
                      <span className="text-xs text-text-muted capitalize">{r.target_type}</span>
                      <span className="text-xs text-text-muted font-mono">{r.target_id.slice(0, 8)}…</span>
                    </div>
                    {r.comment && (
                      <p className="text-text-muted text-xs italic mt-0.5 line-clamp-3">{r.comment}</p>
                    )}
                    <p className="text-text-muted text-xs mt-1">{formatDate(r.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={publishReview}>
                      <input type="hidden" name="adminToken" value={token ?? ''} />
                      <input type="hidden" name="reviewId" value={r.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold"
                      >
                        ✓ Publier
                      </button>
                    </form>
                    <form action={rejectReview}>
                      <input type="hidden" name="adminToken" value={token ?? ''} />
                      <input type="hidden" name="reviewId" value={r.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                      >
                        ✗ Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Publiés */}
        {published.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-base text-text mb-3">
              Avis publiés (20 derniers)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted bg-bg">
                    <th className="py-2.5 px-4 font-medium">Auteur</th>
                    <th className="py-2.5 px-4 font-medium">Note</th>
                    <th className="py-2.5 px-4 font-medium">Type</th>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                    <th className="py-2.5 px-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {published.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                      <td className="py-2 px-4 text-text text-xs font-medium">{r.author_name}</td>
                      <td className="py-2 px-4 text-warning text-xs"><StarRow rating={r.rating} /></td>
                      <td className="py-2 px-4 text-text-muted text-xs capitalize">{r.target_type}</td>
                      <td className="py-2 px-4 text-text-muted text-xs">{formatDate(r.created_at)}</td>
                      <td className="py-2 px-4">
                        <form action={rejectReview} className="inline">
                          <input type="hidden" name="adminToken" value={token ?? ''} />
                          <input type="hidden" name="reviewId" value={r.id} />
                          <button type="submit" className="text-xs text-error hover:underline">Supprimer</button>
                        </form>
                      </td>
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
