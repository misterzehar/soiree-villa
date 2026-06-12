import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Check, X } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { BRIEF_STATUS_LABELS, OFFER_STATUS_LABELS } from '@/types/brief'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import { shortlistOffer, selectOffer, closeBrief } from './actions'
import type { Brief, Offer, BriefStatus, OfferStatus } from '@/types/brief'
import type { FournisseurCategory } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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

  const { data: briefData } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', organizer.id)
    .single()

  if (!briefData) notFound()
  const brief = briefData as Brief

  const { data: offersData } = await supabase
    .from('offers')
    .select('*')
    .eq('brief_id', id)
    .order('status')
    .order('created_at', { ascending: false })

  const offers = (offersData ?? []) as Offer[]

  const statusMeta = BRIEF_STATUS_LABELS[brief.status as BriefStatus]
  const catLabel = brief.target_category
    ? FOURNISSEUR_CATEGORY_LABELS[brief.target_category as FournisseurCategory]
    : null

  const isOpen = brief.status === 'open'
  const selectedOffer = offers.find(o => o.status === 'selected')

  // Server actions (formData carries offerId via hidden input)
  async function handleShortlist(formData: FormData) {
    'use server'
    const offerId = formData.get('offerId')?.toString() ?? ''
    await shortlistOffer(offerId, id)
  }
  async function handleSelect(formData: FormData) {
    'use server'
    const offerId = formData.get('offerId')?.toString() ?? ''
    await selectOffer(offerId, id)
  }
  async function handleClose(_formData: FormData) {
    'use server'
    await closeBrief(id)
  }

  const sortedOffers = [
    ...offers.filter(o => o.status === 'shortlisted'),
    ...offers.filter(o => o.status === 'submitted'),
    ...offers.filter(o => o.status === 'selected'),
    ...offers.filter(o => o.status === 'rejected'),
  ]

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Link
          href="/organisateur/briefs"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes appels d&apos;offres
        </Link>

        {/* Header */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display font-bold text-lg text-text leading-snug flex-1">{brief.title}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-text-muted mb-3">
            <span>{brief.target_type === 'lieu' ? '🏠 Lieu' : `🎵 ${catLabel}`}</span>
            <span>·</span>
            <span>📍 {brief.city}</span>
            <span>·</span>
            <span>📅 {formatDate(brief.event_date)}</span>
            {brief.budget_estimate_cents && (
              <>
                <span>·</span>
                <span>💰 {Math.round(brief.budget_estimate_cents / 100)} €</span>
              </>
            )}
          </div>

          <p className="text-text text-sm leading-relaxed mb-4">{brief.description}</p>

          <p className="text-text-muted text-xs">
            Expire le {formatDate(brief.expires_at)}
          </p>

          {isOpen && (
            <div className="mt-4 pt-4 border-t border-border">
              <form action={handleClose}>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 border border-border text-text-muted rounded-lg hover:border-error/40 hover:text-error transition-colors"
                >
                  Clôturer le brief
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Offre sélectionnée (si applicable) */}
        {selectedOffer && (
          <div className="mb-5 bg-success/5 border border-success/25 rounded-2xl p-5">
            <p className="font-semibold text-success text-sm mb-1">✓ Offre retenue</p>
            <p className="font-display font-bold text-text text-lg">{selectedOffer.responder_name}</p>
            <p className="text-text text-sm mt-1">
              {Math.round(selectedOffer.amount_cents / 100)} € brut
              <span className="text-text-muted"> · Commission : {Math.round(selectedOffer.platform_fee_cents / 100)} € · Net : {Math.round((selectedOffer.amount_cents - selectedOffer.platform_fee_cents) / 100)} €</span>
            </p>
            <p className="text-text-muted text-sm mt-2 leading-relaxed">{selectedOffer.message}</p>
          </div>
        )}

        {/* Offres reçues */}
        <section>
          <h2 className="font-display font-semibold text-base text-text mb-3">
            Offres reçues ({offers.length})
          </h2>

          {offers.length === 0 ? (
            <div className="bg-surface rounded-2xl p-6 text-center">
              <p className="text-text-muted text-sm">Aucune offre reçue pour le moment.</p>
              <p className="text-text-muted text-xs mt-1">Les partenaires matchants ont été notifiés par email.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedOffers.map(offer => {
                if (offer.status === 'selected') return null
                const offerStatus = OFFER_STATUS_LABELS[offer.status as OfferStatus]
                return (
                  <div
                    key={offer.id}
                    className={`bg-surface rounded-2xl p-4 shadow-sm ${offer.status === 'rejected' ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-display font-semibold text-text text-sm">{offer.responder_name}</p>
                        <p className="text-primary font-bold text-lg">{Math.round(offer.amount_cents / 100)} €</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${offerStatus.color}`}>
                        {offerStatus.label}
                      </span>
                    </div>

                    <p className="text-text text-sm leading-relaxed mb-3">{offer.message}</p>

                    {isOpen && offer.status !== 'rejected' && (
                      <div className="flex gap-2 flex-wrap">
                        {offer.status === 'submitted' && (
                          <form action={handleShortlist}>
                            <input type="hidden" name="offerId" value={offer.id} />
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Présélectionner
                            </button>
                          </form>
                        )}
                        <form action={handleSelect}>
                          <input type="hidden" name="offerId" value={offer.id} />
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Retenir cette offre
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
