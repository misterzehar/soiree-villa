import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { QUOTE_STATUS_LABELS } from '@/types/quote'
import type { Quote, QuoteStatus } from '@/types/quote'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DevisListPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/devis')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!organizer) redirect('/organisateur/inscription')

  const { data } = await supabase
    .from('quotes')
    .select('id, client_name, client_email, event_date, total_cents, status, created_at')
    .eq('organizer_id', organizer.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const quotes = (data ?? []) as Quote[]

  const active   = quotes.filter(q => ['draft', 'sent'].includes(q.status))
  const archived = quotes.filter(q => ['accepted', 'rejected', 'cancelled'].includes(q.status))

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/organisateur"
              className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-xs mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tableau de bord
            </Link>
            <h1 className="font-display font-bold text-xl text-text">Mes devis</h1>
          </div>
          <Link
            href="/organisateur/devis/nouveau"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center shadow-sm">
            <p className="text-text-muted text-sm mb-4">Aucun devis pour le moment.</p>
            <Link
              href="/organisateur/devis/nouveau"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer mon premier devis
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-6">
                <h2 className="font-display font-semibold text-base text-text mb-3">En cours</h2>
                <div className="flex flex-col gap-3">
                  {active.map(q => {
                    const meta = QUOTE_STATUS_LABELS[q.status as QuoteStatus]
                    return (
                      <Link
                        key={q.id}
                        href={`/organisateur/devis/${q.id}`}
                        className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="font-display font-semibold text-text text-sm leading-snug truncate">
                            {q.client_name}
                          </p>
                          <p className="text-text-muted text-xs mt-0.5">{formatDate(q.event_date)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-text text-base">{Math.round(q.total_cents / 100)} €</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-base text-text mb-3">Historique</h2>
                <div className="flex flex-col gap-2">
                  {archived.map(q => {
                    const meta = QUOTE_STATUS_LABELS[q.status as QuoteStatus]
                    return (
                      <Link
                        key={q.id}
                        href={`/organisateur/devis/${q.id}`}
                        className="bg-surface rounded-2xl p-4 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="font-medium text-text text-sm truncate">{q.client_name}</p>
                          <p className="text-text-muted text-xs">{formatDate(q.event_date)}</p>
                        </div>
                        <span className="text-text-muted text-sm shrink-0">{Math.round(q.total_cents / 100)} €</span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
