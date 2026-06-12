import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { BRIEF_STATUS_LABELS } from '@/types/brief'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Brief, BriefStatus } from '@/types/brief'
import type { FournisseurCategory } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BriefsPage() {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/briefs')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()

  if (!organizer) redirect('/organisateur/inscription')

  const { data: briefsData } = await supabase
    .from('briefs')
    .select('id, target_type, target_category, city, event_date, title, status, created_at')
    .eq('organizer_id', organizer.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const briefs = (briefsData ?? []) as Brief[]

  // Compter les offres par brief
  const briefIds = briefs.map(b => b.id)
  const { data: offerCounts } = briefIds.length > 0
    ? await supabase
        .from('offers')
        .select('brief_id')
        .in('brief_id', briefIds)
    : { data: [] }

  const countsByBrief: Record<string, number> = {}
  for (const o of offerCounts ?? []) {
    countsByBrief[o.brief_id] = (countsByBrief[o.brief_id] ?? 0) + 1
  }

  const active = briefs.filter(b => b.status === 'open' || b.status === 'draft')
  const closed = briefs.filter(b => b.status === 'selected' || b.status === 'closed')

  function BriefCard({ brief }: { brief: Brief }) {
    const statusMeta = BRIEF_STATUS_LABELS[brief.status as BriefStatus]
    const offerCount = countsByBrief[brief.id] ?? 0
    const catLabel = brief.target_category
      ? FOURNISSEUR_CATEGORY_LABELS[brief.target_category as FournisseurCategory]
      : null

    return (
      <Link
        href={`/organisateur/briefs/${brief.id}`}
        className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
      >
        <FileText className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
            <span className="text-xs text-text-muted capitalize">
              {brief.target_type === 'lieu' ? '🏠 Lieu' : `🎵 ${catLabel ?? 'Prestataire'}`}
            </span>
          </div>
          <p className="font-display font-semibold text-text text-sm leading-snug truncate">{brief.title}</p>
          <p className="text-text-muted text-xs mt-1">
            {brief.city} · {formatDateShort(brief.event_date)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-text text-lg">{offerCount}</p>
          <p className="text-text-muted text-xs">offre{offerCount !== 1 ? 's' : ''}</p>
        </div>
      </Link>
    )
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/organisateur" className="text-xs text-text-muted hover:text-text transition-colors">
              ← {organizer.display_name}
            </Link>
            <h1 className="font-display font-bold text-xl text-text mt-1">Appels d&apos;offres</h1>
          </div>
          <Link
            href="/organisateur/briefs/nouveau"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </Link>
        </div>

        {/* Actifs */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-base text-text mb-3">En cours</h2>
          {active.length === 0 ? (
            <div className="bg-surface rounded-2xl p-6 text-center">
              <p className="text-text-muted text-sm mb-4">Aucun appel d&apos;offres actif.</p>
              <Link
                href="/organisateur/briefs/nouveau"
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer un appel d&apos;offres
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {active.map(b => <BriefCard key={b.id} brief={b} />)}
            </div>
          )}
        </section>

        {/* Clôturés */}
        {closed.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-base text-text mb-3">Clôturés</h2>
            <div className="flex flex-col gap-2">
              {closed.map(b => <BriefCard key={b.id} brief={b} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
