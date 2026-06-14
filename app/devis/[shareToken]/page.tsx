import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { acceptQuote, rejectQuote } from './actions'
import type { QuoteStatus, QuoteLine } from '@/types/quote'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const STATUS_MESSAGES: Partial<Record<QuoteStatus, { text: string; color: string }>> = {
  accepted:  { text: 'Vous avez accepté ce devis. Merci !',    color: 'text-success' },
  rejected:  { text: 'Vous avez décliné ce devis.',             color: 'text-text-muted' },
  cancelled: { text: 'Ce devis a été annulé par l\'organisateur.', color: 'text-text-muted' },
}

export default async function PublicQuotePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params

  const supabase = createServerSupabase()

  const { data: qData } = await supabase
    .from('quotes')
    .select('*, quote_lines(*), organizers(display_name)')
    .eq('share_token', shareToken)
    .single()

  if (!qData) notFound()

  const quote       = qData
  const lines       = (qData.quote_lines as QuoteLine[]).sort((a, b) => a.sort_order - b.sort_order)
  const orgName     = Array.isArray(qData.organizers)
    ? qData.organizers[0]?.display_name
    : qData.organizers?.display_name

  const isSent      = quote.status === 'sent'
  const statusMsg   = STATUS_MESSAGES[quote.status as QuoteStatus]

  async function handleAccept(_formData: FormData) {
    'use server'
    await acceptQuote(shareToken)
  }

  async function handleReject(_formData: FormData) {
    'use server'
    await rejectQuote(shareToken)
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-8 pb-20">

        {/* Brand header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">Soirée Villa</p>
          <h1 className="font-display font-bold text-2xl text-text">Votre devis</h1>
          {orgName && (
            <p className="text-text-muted text-sm mt-1">Préparé par <strong className="text-text">{orgName}</strong></p>
          )}
        </div>

        {/* Status message */}
        {statusMsg && (
          <div className="mb-6 bg-surface rounded-2xl px-5 py-4 text-center shadow-sm">
            <p className={`text-sm font-semibold ${statusMsg.color}`}>{statusMsg.text}</p>
          </div>
        )}

        {/* Event info */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2">Événement</p>
          <div className="flex flex-col gap-1.5">
            <p className="text-text font-semibold text-sm capitalize">{formatDate(quote.event_date)}</p>
            {quote.description && (
              <p className="text-text-muted text-sm leading-relaxed">{quote.description}</p>
            )}
          </div>
        </div>

        {/* Lines */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-4">Prestations</p>
          <div className="flex flex-col">
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
          <div className="flex items-center justify-between pt-4 mt-1 border-t border-border">
            <p className="font-display font-bold text-text text-base">Total TTC</p>
            <p className="font-display font-bold text-primary text-2xl">{Math.round(quote.total_cents / 100)} €</p>
          </div>
        </div>

        {/* CTA — only if status is sent */}
        {isSent && (
          <div className="flex flex-col gap-3">
            <form action={handleAccept}>
              <button
                type="submit"
                className="w-full bg-success hover:bg-success/90 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                Accepter le devis
              </button>
            </form>
            <form action={handleReject}>
              <button
                type="submit"
                className="w-full border border-border text-text-muted hover:border-error/40 hover:text-error font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Décliner
              </button>
            </form>
          </div>
        )}

        <p className="text-text-muted text-xs text-center mt-8 leading-relaxed">
          Devis établi par Soirée Villa · Nice, Côte d&apos;Azur<br />
          TVA non applicable (auto-entrepreneur)
        </p>
      </div>
    </main>
  )
}
