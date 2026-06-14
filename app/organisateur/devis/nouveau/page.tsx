import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { QuoteComposer } from './_components/quote-composer'
import type { FournisseurCategory } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

export default async function NouveauDevisPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/devis/nouveau')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!organizer) redirect('/organisateur/inscription')

  const [lieuxRes, foRes] = await Promise.all([
    supabase.from('lieux').select('id, name, city').eq('is_approved', true).order('name'),
    supabase.from('fournisseurs').select('id, name, city, category').eq('is_approved', true).order('name'),
  ])

  const lieux        = (lieuxRes.data ?? []) as { id: string; name: string; city: string }[]
  const fournisseurs = (foRes.data ?? []) as { id: string; name: string; city: string; category: FournisseurCategory }[]

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <Link
          href="/organisateur/devis"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes devis
        </Link>

        <h1 className="font-display font-bold text-xl text-text mb-6">Nouveau devis</h1>

        <QuoteComposer lieux={lieux} fournisseurs={fournisseurs} />
      </div>
    </main>
  )
}
