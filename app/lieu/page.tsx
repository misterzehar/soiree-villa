import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Pencil, ExternalLink } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import type { Lieu } from '@/types/lieu'

export default async function LieuDashboardPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/lieu')

  const supabase = createServerSupabase()
  const { data: lieuData } = await supabase
    .from('lieux')
    .select('*')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!lieuData) redirect('/lieu/inscription')

  const lieu = lieuData as Lieu

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Espace lieu
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Gérez la fiche de votre lieu.
        </p>

        {/* Statut */}
        <div className={`mb-5 rounded-2xl px-5 py-4 flex items-start gap-3 ${
          lieu.is_approved
            ? 'bg-success/10 border border-success/25'
            : 'bg-warning/10 border border-warning/25'
        }`}>
          {lieu.is_approved
            ? <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            : <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          }
          <div>
            <p className={`font-semibold text-sm ${lieu.is_approved ? 'text-success' : 'text-warning'}`}>
              {lieu.is_approved ? 'Lieu validé et visible' : 'En attente de validation'}
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              {lieu.is_approved
                ? 'Votre lieu est visible par les organisateurs.'
                : 'Vous serez notifié par email dès validation.'}
            </p>
          </div>
        </div>

        {/* Fiche résumée */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          {lieu.photo_url && (
            <img
              src={lieu.photo_url}
              alt={lieu.name}
              className="w-full h-36 object-cover rounded-xl mb-4"
            />
          )}
          <h2 className="font-display font-bold text-lg text-text mb-1">{lieu.name}</h2>
          <p className="text-text-muted text-sm mb-1">{lieu.city}{lieu.address ? ` · ${lieu.address}` : ''}</p>
          {lieu.ambiance && <p className="text-text-muted text-sm mb-2 italic">{lieu.ambiance}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {lieu.lieu_type && (
              <span className="text-xs bg-bg border border-border rounded-full px-2.5 py-0.5 text-text-muted capitalize">
                {lieu.lieu_type}
              </span>
            )}
            {lieu.capacity && (
              <span className="text-xs bg-bg border border-border rounded-full px-2.5 py-0.5 text-text-muted">
                {lieu.capacity} pers. max
              </span>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex gap-2 flex-wrap">
            <Link
              href="/lieu/edit"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier la fiche
            </Link>
            {lieu.is_approved && (
              <Link
                href={`/lieux/${lieu.slug}`}
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
          href="/lieu/demandes"
          className="block bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-text mb-0.5">Demandes reçues</h3>
              <p className="text-text-muted text-sm">
                Appels d&apos;offres d&apos;organisateurs pour votre ville.
              </p>
            </div>
            <span className="text-primary text-sm font-semibold shrink-0">Voir →</span>
          </div>
        </Link>

      </div>
    </main>
  )
}
