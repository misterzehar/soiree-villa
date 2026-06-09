import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { FournisseurForm } from '../_components/fournisseur-form'
import { updateFournisseurProfile } from './actions'
import type { Fournisseur } from '@/types/fournisseur'

export default async function FournisseurEditPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/fournisseur/edit')

  const supabase = createServerSupabase()
  const { data: fournisseurData } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!fournisseurData) redirect('/fournisseur/inscription')

  const f = fournisseurData as Fournisseur
  const boundUpdate = updateFournisseurProfile.bind(null, f.id)

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <Link
          href="/fournisseur"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mon espace fournisseur
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Modifier la fiche
        </h1>
        <p className="text-text-muted text-sm mb-6">
          <span className="font-medium text-text">{f.name}</span>
        </p>

        <FournisseurForm
          action={boundUpdate}
          initialData={{
            category:    f.category,
            city:        f.city,
            description: f.description ?? undefined,
            photo_url:   f.photo_url ?? undefined,
            price_range: f.price_range ?? undefined,
            website_url: f.website_url ?? undefined,
            axes_scores: f.axes_scores,
          }}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </main>
  )
}
