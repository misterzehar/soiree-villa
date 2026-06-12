import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { OFFER_STATUS_LABELS } from '@/types/brief'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import { submitFournisseurOffer, updateFournisseurOffer } from './actions'
import type { Brief, Offer, OfferStatus } from '@/types/brief'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function FournisseurBriefDetailPage({ params }: { params: Promise<{ briefId: string }> }) {
  const { briefId } = await params

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect(`/connexion?redirect=/fournisseur/demandes/${briefId}`)

  const supabase = createServerSupabase()

  const { data: fournisseur } = await supabase
    .from('fournisseurs')
    .select('id, name, city, category, is_approved')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!fournisseur) redirect('/fournisseur/inscription')

  const { data: briefData } = await supabase
    .from('briefs')
    .select('id, title, description, city, event_date, expires_at, budget_estimate_cents, status, target_category, organizer_id, organizers(display_name)')
    .eq('id', briefId)
    .eq('target_type', 'fournisseur')
    .single()

  if (!briefData) notFound()
  const brief = briefData as Brief & { organizers: { display_name: string } | { display_name: string }[] }
  const organizerName = Array.isArray(brief.organizers) ? brief.organizers[0]?.display_name : brief.organizers?.display_name
  const catLabel = brief.target_category ? FOURNISSEUR_CATEGORY_LABELS[brief.target_category as keyof typeof FOURNISSEUR_CATEGORY_LABELS] : ''

  const { data: myOffer } = await supabase
    .from('offers')
    .select('id, amount_cents, message, status')
    .eq('brief_id', briefId)
    .eq('responder_id', user.id)
    .single()

  const offer = myOffer as Offer | null
  const isExpired = new Date(brief.expires_at) < new Date()
  const isClosed = brief.status !== 'open'
  const canSend = !isClosed && !isExpired && fournisseur.is_approved
  const canEdit = canSend && offer?.status === 'submitted'

  async function handleSubmit(formData: FormData) {
    'use server'
    await submitFournisseurOffer(briefId, formData)
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateFournisseurOffer(offer!.id, briefId, formData)
  }

  const offerStatusMeta = offer ? OFFER_STATUS_LABELS[offer.status as OfferStatus] : null

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <Link
          href="/fournisseur/demandes"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Demandes reçues
        </Link>

        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-primary text-xs font-semibold uppercase tracking-wide mb-1">
            Appel d&apos;offres · {catLabel}
          </p>
          <h1 className="font-display font-bold text-lg text-text mb-2 leading-snug">{brief.title}</h1>

          <div className="flex flex-wrap gap-2 text-xs text-text-muted mb-3">
            <span>📅 {formatDate(brief.event_date)}</span>
            <span>·</span>
            <span>📍 {brief.city}</span>
            {brief.budget_estimate_cents && (
              <>
                <span>·</span>
                <span>💰 Budget estimé : {Math.round(brief.budget_estimate_cents / 100)} €</span>
              </>
            )}
          </div>

          <p className="text-text text-sm leading-relaxed mb-3">{brief.description}</p>

          {organizerName && <p className="text-text-muted text-xs">Organisateur : {organizerName}</p>}
          <p className="text-text-muted text-xs mt-0.5">Répond avant le {formatDate(brief.expires_at)}</p>
        </div>

        {offer && offerStatusMeta && (
          <div className={`mb-5 rounded-2xl px-5 py-4 border ${
            offer.status === 'selected' ? 'bg-success/5 border-success/25'
              : offer.status === 'rejected' ? 'bg-error/5 border-error/20'
              : offer.status === 'shortlisted' ? 'bg-warning/5 border-warning/25'
              : 'bg-surface border-border'
          }`}>
            <p className={`font-semibold text-sm mb-1 ${offerStatusMeta.color.split(' ')[1]}`}>
              Mon offre — {offerStatusMeta.label}
            </p>
            <p className="text-text font-bold text-lg">{Math.round(offer.amount_cents / 100)} €</p>
            <p className="text-text-muted text-sm mt-1 leading-relaxed">{offer.message}</p>
            {offer.status === 'selected' && (
              <p className="text-success text-xs mt-2">
                🎉 Votre offre a été retenue. L&apos;équipe Soirée Villa vous contactera pour les modalités.
              </p>
            )}
          </div>
        )}

        {canSend && !offer && (
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="font-display font-semibold text-base text-text mb-4">Soumettre une offre</h2>
            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Montant proposé (€) *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="50"
                  placeholder="Ex : 1200"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors"
                />
                <p className="text-text-muted text-xs mt-1">Commission Soirée Villa : 15% · Vous recevrez 85% du montant.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Votre message *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Décrivez votre proposition, votre expérience, vos conditions…"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Envoyer mon offre
              </button>
            </form>
          </div>
        )}

        {canEdit && offer && (
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="font-display font-semibold text-base text-text mb-4">Modifier mon offre</h2>
            <form action={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Montant (€) *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="50"
                  defaultValue={Math.round(offer.amount_cents / 100)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Message *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  defaultValue={offer.message}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-primary/40 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Mettre à jour l&apos;offre
              </button>
            </form>
          </div>
        )}

        {(isClosed || isExpired) && !offer && (
          <div className="bg-surface rounded-2xl p-5 text-center">
            <p className="text-text-muted text-sm">
              {isClosed ? 'Cet appel d\'offres est clôturé.' : 'Le délai de réponse est expiré.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
