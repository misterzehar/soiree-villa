import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { OFFER_STATUS_LABELS } from '@/types/brief'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Brief, OfferStatus } from '@/types/brief'

export const dynamic = 'force-dynamic'

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function FournisseurDemandesPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/fournisseur/demandes')

  const supabase = createServerSupabase()

  const { data: fournisseur } = await supabase
    .from('fournisseurs')
    .select('id, name, city, category, is_approved')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!fournisseur) redirect('/fournisseur/inscription')

  if (!fournisseur.is_approved) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="max-w-md mx-auto px-4 pt-8 pb-20">
          <Link href="/fournisseur" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Espace fournisseur
          </Link>
          <div className="bg-warning/10 border border-warning/25 rounded-2xl p-5">
            <p className="font-semibold text-warning text-sm">Profil en attente de validation</p>
            <p className="text-text-muted text-sm mt-1">Vous recevrez les appels d'offres par email dès validation de votre profil.</p>
          </div>
        </div>
      </main>
    )
  }

  const { data: briefsData } = await supabase
    .from('briefs')
    .select('id, title, description, city, event_date, budget_estimate_cents, expires_at, target_category, created_at')
    .eq('target_type', 'fournisseur')
    .eq('target_category', fournisseur.category)
    .eq('city', fournisseur.city)
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(30)

  const briefs = (briefsData ?? []) as Pick<Brief, 'id' | 'title' | 'description' | 'city' | 'event_date' | 'budget_estimate_cents' | 'expires_at' | 'target_category' | 'created_at'>[]

  const briefIds = briefs.map(b => b.id)
  const { data: myOffersData } = briefIds.length > 0
    ? await supabase
        .from('offers')
        .select('brief_id, status')
        .eq('responder_id', user.id)
        .in('brief_id', briefIds)
    : { data: [] }

  const myOffersByBrief: Record<string, OfferStatus> = {}
  for (const o of myOffersData ?? []) myOffersByBrief[o.brief_id] = o.status as OfferStatus

  const catLabel = FOURNISSEUR_CATEGORY_LABELS[fournisseur.category as keyof typeof FOURNISSEUR_CATEGORY_LABELS]

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <Link href="/fournisseur" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Espace fournisseur
        </Link>

        <h1 className="font-display font-bold text-xl text-text mb-1">Demandes reçues</h1>
        <p className="text-text-muted text-sm mb-6">
          Appels d&apos;offres ouverts pour les {catLabel} à {fournisseur.city}.
        </p>

        {briefs.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <FileText className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-sm">Aucune demande en cours pour votre profil.</p>
            <p className="text-text-muted text-xs mt-1">Vous serez notifié par email dès qu&apos;une demande vous correspond.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {briefs.map(brief => {
              const myStatus = myOffersByBrief[brief.id]
              const offerStatusMeta = myStatus ? OFFER_STATUS_LABELS[myStatus] : null
              return (
                <Link
                  key={brief.id}
                  href={`/fournisseur/demandes/${brief.id}`}
                  className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-display font-semibold text-text text-sm leading-snug flex-1">{brief.title}</p>
                    {offerStatusMeta && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${offerStatusMeta.color}`}>
                        {offerStatusMeta.label}
                      </span>
                    )}
                    {!myStatus && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-primary/10 text-primary">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs mb-2 line-clamp-2">{brief.description}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>📅 {formatDateShort(brief.event_date)}</span>
                    {brief.budget_estimate_cents && (
                      <span>💰 {Math.round(brief.budget_estimate_cents / 100)} €</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
