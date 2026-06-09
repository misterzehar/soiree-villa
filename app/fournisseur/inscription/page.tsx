import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { FournisseurForm } from '../_components/fournisseur-form'
import { createFournisseurProfile } from './actions'

export default async function FournisseurInscriptionPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/fournisseur/inscription')

  const supabase = createServerSupabase()
  const { data: existing } = await supabase
    .from('fournisseurs')
    .select('id')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (existing) redirect('/fournisseur')

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Accueil
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Référencer votre prestation
        </h1>
        <p className="text-text-muted text-sm mb-6 leading-relaxed">
          Traiteur, DJ, décoration, animation — rejoignez la marketplace Soirée Villa et soyez contacté par les organisateurs.
        </p>

        <FournisseurForm
          action={createFournisseurProfile}
          showName
          submitLabel="Soumettre ma prestation"
        />
      </div>
    </main>
  )
}
