import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { LieuForm } from '../_components/lieu-form'
import { updateLieuProfile } from './actions'
import type { Lieu } from '@/types/lieu'

export default async function LieuEditPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/lieu/edit')

  const supabase = createServerSupabase()
  const { data: lieuData } = await supabase
    .from('lieux')
    .select('*')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!lieuData) redirect('/lieu/inscription')

  const lieu = lieuData as Lieu
  const boundUpdate = updateLieuProfile.bind(null, lieu.id)

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <Link
          href="/lieu"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mon espace lieu
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Modifier la fiche
        </h1>
        <p className="text-text-muted text-sm mb-6">
          <span className="font-medium text-text">{lieu.name}</span>
        </p>

        <LieuForm
          action={boundUpdate}
          initialData={{
            address:     lieu.address ?? undefined,
            city:        lieu.city,
            capacity:    lieu.capacity ?? undefined,
            ambiance:    lieu.ambiance ?? undefined,
            lieu_type:   lieu.lieu_type,
            photo_url:   lieu.photo_url ?? undefined,
            website_url: lieu.website_url ?? undefined,
            axes_scores: lieu.axes_scores,
          }}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </main>
  )
}
