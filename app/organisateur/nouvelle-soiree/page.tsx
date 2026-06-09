import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { CreateForm } from './create-form'
import type { Lieu } from '@/types/lieu'

export default async function NouvellesSoireePage() {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/nouvelle-soiree')

  const supabase = createServerSupabase()
  const [{ data: organizer }, { data: lieuxData }] = await Promise.all([
    supabase.from('organizers').select('id, display_name').eq('user_id', user.id).single(),
    supabase.from('lieux').select('*').eq('is_approved', true).order('name'),
  ])

  if (!organizer) redirect('/organisateur/inscription')

  const availableLieux = (lieuxData ?? []) as Lieu[]

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <Link
          href="/organisateur"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Nouvelle soirée
        </h1>
        <p className="text-text-muted text-sm mb-6 leading-relaxed">
          Remplis les 6 sections ci-dessous.
          Ta soirée sera soumise à validation avant publication — sauf si tu es J&nbsp;😊
        </p>

        <CreateForm availableLieux={availableLieux} />

      </div>
    </main>
  )
}
