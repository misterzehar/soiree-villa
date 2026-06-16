import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Pencil, ExternalLink } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Fournisseur } from '@/types/fournisseur'

export default async function FournisseurDashboardPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/fournisseur')

  const supabase = createServerSupabase()
  const { data: fournisseurData } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!fournisseurData) redirect('/fournisseur/inscription')

  const f = fournisseurData as Fournisseur

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Espace fournisseur
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Gérez votre fiche prestataire.
        </p>

        {/* Statut */}
        <div className={`mb-5 rounded-2xl px-5 py-4 flex items-start gap-3 ${
          f.is_approved
            ? 'bg-success/10 border border-success/25'
            : 'bg-warning/10 border border-warning/25'
        }`}>
          {f.is_approved
            ? <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            : <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          }
          <div>
            <p className={`font-semibold text-sm ${f.is_approved ? 'text-success' : 'text-warning'}`}>
              {f.is_approved ? 'Prestation validée et visible' : 'En attente de validation'}
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              {f.is_approved
                ? 'Votre fiche est visible par les organisateurs.'
                : 'Vous serez notifié par email dès validation.'}
            </p>
          </div>
        </div>

        {/* Fiche résumée */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          {f.photo_url && (
            <img
              src={f.photo_url}
              alt={f.name}
              className="w-full h-36 object-cover rounded-xl mb-4"
            />
          )}
          <h2 className="font-display font-bold text-lg text-text mb-1">{f.name}</h2>
          <p className="text-primary text-xs font-semibold uppercase tracking-wide mb-1">
            {FOURNISSEUR_CATEGORY_LABELS[f.category]}
          </p>
          <p className="text-text-muted text-sm mb-1">{f.city}</p>
          {f.description && <p className="text-text-muted text-sm mt-1 leading-relaxed line-clamp-3">{f.description}</p>}
          {f.price_range && (
            <p className="text-text-muted text-xs mt-2">💰 {f.price_range}</p>
          )}

          <div className="mt-4 pt-4 border-t border-border flex gap-2 flex-wrap">
            <Link
              href="/fournisseur/edit"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier la fiche
            </Link>
            {f.is_approved && (
              <Link
                href={`/fournisseurs/${f.slug}`}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 border border-border text-text-muted rounded-xl hover:text-text transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Voir la fiche publique
              </Link>
            )}
          </div>
        </div>

        {/* Demandes reçues */}
        <Link
          href="/fournisseur/demandes"
          className="block bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow mb-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-text mb-0.5">Demandes reçues</h3>
              <p className="text-text-muted text-sm">
                Appels d&apos;offres d&apos;organisateurs pour votre catégorie.
              </p>
            </div>
            <span className="text-primary text-sm font-semibold shrink-0">Voir →</span>
          </div>
        </Link>

        {/* Demandes de contact */}
        <Link
          href="/fournisseur/demandes-contact"
          className="block bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-text mb-0.5">Demandes de contact</h3>
              <p className="text-text-muted text-sm">
                Messages envoyés depuis la fiche publique de votre prestation.
              </p>
            </div>
            <span className="text-primary text-sm font-semibold shrink-0">Voir →</span>
          </div>
        </Link>

      </div>
    </main>
  )
}
