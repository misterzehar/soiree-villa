import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, X } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { QUOTE_STATUS_LABELS } from '@/types/quote'
import { sendQuote, cancelQuote } from '../actions'
import type { Quote, QuoteLine, QuoteStatus } from '@/types/quote'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function DevisDetailPage({
  params, searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: sendError } = await searchParams

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()
  if (!organizer) redirect('/organisateur/inscription')

  const { data: qData } = await supabase
    .from('quotes')
    .select('*, quote_lines(*)')
    .eq('id', id)
    .eq('organizer_id', organizer.id)
    .single()

  if (!qData) notFound()

  const quote = qData as Quote
  const lines = (qData.quote_lines as QuoteLine[]).sort((a, b) => a.sort_order - b.sort_order)
  const meta  = QUOTE_STATUS_LABELS[quote.status as QuoteStatus]

  const isDraft     = quote.status === 'draft'
  const isSent      = quote.status === 'sent'
  const isAccepted  = quote.status === 'accepted'
  const canSend     = isDraft || isSent
  const canCancel   = isDraft || isSent

  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const shareUrl  = `${baseUrl}/devis/${quote.share_token}`

  // Server action wrappers
  async function handleSend(_formData: FormData) {
    'use server'
    const result = await sendQuote(id)
    if (result?.error) {
      redirect(`/organisateur/devis/${id}?error=${encodeURIComponent(result.error)}`)
    }
  }

  async function handleCancel(_formData: FormData) {
    'use server'
    await cancelQuote(id)
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Link
          href="/organisateur/devis"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes devis
        </Link>

        {/* Error banner */}
        {sendError && (
          <div className="mb-5 bg-error/5 border border-error/20 rounded-xl px-4 py-3">
            <p className="text-error text-sm">{decodeURIComponent(sendError)}</p>
          </div>
        )}

        {/* Header card */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-text-muted text-xs mb-0.5">Client</p>
              <h1 className="font-display font-bold text-xl text-text">{quote.client_name}</h1>
              <p className="text-text-muted text-sm">{quote.client_email}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${meta.color}`}>
              {meta.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-text-muted mb-4 border-t border-border pt-3">
            <span>📅 {formatDate(quote.event_date)}</span>
            <span>·</span>
            <span>Réf. {quote.id.slice(0, 8).toUpperCase()}</span>
          </div>

          {quote.description && (
            <p className="text-text text-sm leading-relaxed">{quote.description}</p>
          )}
        </div>

        {/* Lines */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wide mb-4">Prestations</h2>
          <div className="flex flex-col gap-0">
            {lines.map(line => (
              <div key={line.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-text text-sm">{line.label}</span>
                <span className="font-semibold text-text text-sm shrink-0 ml-4">
                  {Math.round(line.amount_cents / 100)} €
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 mt-1">
            <div>
              <p className="text-text-muted text-xs">Commission Soirée Villa (15 %)</p>
              <p className="text-text-muted text-xs">Net reversé</p>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-sm">- {Math.round(quote.platform_fee_cents / 100)} €</p>
              <p className="text-success text-sm font-semibold">{Math.round((quote.total_cents - quote.platform_fee_cents) / 100)} €</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
            <p className="font-display font-bold text-text text-base">Total TTC client</p>
            <p className="font-display font-bold text-primary text-2xl">{Math.round(quote.total_cents / 100)} €</p>
          </div>
        </div>

        {/* Share link (if sent or accepted) */}
        {(isSent || isAccepted) && (
          <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
            <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wide mb-2">Lien client</h2>
            <p className="text-text-muted text-xs mb-2">Envoyé à {quote.client_email}</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm underline break-all"
            >
              {shareUrl}
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {canSend && (
            <form action={handleSend}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                {isSent ? 'Renvoyer le devis (PDF régénéré)' : 'Envoyer le devis au client'}
              </button>
            </form>
          )}

          {canCancel && (
            <form action={handleCancel}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 border border-border text-text-muted hover:border-error/40 hover:text-error font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Annuler ce devis
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
