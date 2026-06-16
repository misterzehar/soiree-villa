import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, MailOpen, Archive } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import type { ContactRequest } from '@/types/contact-request'
import { markRead, archiveRequest } from './actions'

export const dynamic = 'force-dynamic'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function FournisseurDemandesContactPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/fournisseur/demandes-contact')

  const supabase = createServerSupabase()

  const { data: fData } = await supabase
    .from('fournisseurs')
    .select('id, name')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!fData) redirect('/fournisseur/inscription')

  const { data: requestsData } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('target_type', 'fournisseur')
    .eq('target_id', fData.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  const requests = (requestsData ?? []) as ContactRequest[]
  const unreadCount = requests.filter(r => !r.is_read).length

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <Link
          href="/fournisseur"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Espace fournisseur
        </Link>

        <div className="flex items-baseline justify-between mb-1">
          <h1 className="font-display font-bold text-2xl text-text">Demandes de contact</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-text-muted text-sm mb-6">{fData.name}</p>

        {requests.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center shadow-sm">
            <p className="text-2xl mb-3">📭</p>
            <p className="text-text font-semibold text-sm mb-1">Aucune demande pour l&apos;instant</p>
            <p className="text-text-muted text-xs">Les demandes de contact arrivent ici dès qu&apos;un visiteur remplit le formulaire sur votre fiche.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map(r => (
              <div
                key={r.id}
                className={`bg-surface rounded-2xl p-4 shadow-sm border ${r.is_read ? 'border-border' : 'border-primary/40'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {r.is_read
                      ? <MailOpen className="w-4 h-4 text-text-muted shrink-0" />
                      : <Mail className="w-4 h-4 text-primary shrink-0" />
                    }
                    <div>
                      <p className="font-semibold text-sm text-text">{r.sender_name}</p>
                      <a
                        href={`mailto:${r.sender_email}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {r.sender_email}
                      </a>
                    </div>
                  </div>
                  <p className="text-text-muted text-xs shrink-0">{formatDate(r.created_at)}</p>
                </div>

                <p className="text-text text-sm leading-relaxed mb-3 whitespace-pre-wrap">{r.message}</p>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <a
                    href={`mailto:${r.sender_email}?subject=Re: votre demande de contact`}
                    className="flex-1 text-center text-xs font-semibold py-1.5 px-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Répondre par email
                  </a>
                  {!r.is_read && (
                    <form action={markRead}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <button
                        type="submit"
                        className="text-xs py-1.5 px-3 border border-border text-text-muted rounded-lg hover:text-text transition-colors"
                      >
                        Marquer lu
                      </button>
                    </form>
                  )}
                  <form action={archiveRequest}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <button
                      type="submit"
                      className="text-xs py-1.5 px-3 border border-border text-text-muted rounded-lg hover:text-text transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
