import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { BriefForm } from './_components/brief-form'

export const dynamic = 'force-dynamic'

export default async function NouveauBriefPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/briefs/nouveau')

  const supabase = createServerSupabase()
  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, city')
    .eq('user_id', user.id)
    .single()

  if (!organizer) redirect('/organisateur/inscription')

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

        <h1 className="font-display font-bold text-xl text-text mb-1">
          Nouvel appel d&apos;offres
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Décrivez votre besoin — les partenaires matchants seront notifiés par email.
        </p>

        <BriefForm defaultCity={organizer.city ?? 'Nice'} />
      </div>
    </main>
  )
}
