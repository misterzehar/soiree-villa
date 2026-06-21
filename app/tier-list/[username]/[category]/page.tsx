import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { TIER_CATEGORY_LABELS, type TierCategory, type ItemsByTier, emptyItemsByTier } from '@/lib/community-tier'
import { TIER_CONFIG, type TierLabel } from '@/lib/tier'
import { SiteHeader } from '@/components/site-header'
import type { Experience } from '@/types/experience'
import type { Lieu } from '@/types/lieu'
import type { Fournisseur } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES: TierCategory[] = ['experiences-mine', 'experiences-all', 'lieux', 'fournisseurs']
const TIER_ORDER: TierLabel[] = ['S', 'A', 'B', 'C', 'D']

type ItemMeta = { id: string; name: string; photo: string | null; subtitle?: string }

export default async function PublicTierListPage({
  params,
}: {
  params: Promise<{ username: string; category: string }>
}) {
  const { username: usernameRaw, category: catParam } = await params
  if (!VALID_CATEGORIES.includes(catParam as TierCategory)) notFound()
  const category = catParam as TierCategory
  const username = decodeURIComponent(usernameRaw)

  const supabase = createServerSupabase()

  // Resolve user: try by display_name first, fallback to user_id
  const { data: profileByName } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('display_name', username)
    .single()

  const { data: profileById } = !profileByName
    ? await supabase.from('profiles').select('id, display_name').eq('id', username).single()
    : { data: null }

  const profile = profileByName ?? profileById
  if (!profile) notFound()

  // Fetch tier list
  const { data: tierListRow } = await supabase
    .from('user_tier_lists')
    .select('items_by_tier, updated_at')
    .eq('user_id', profile.id)
    .eq('category', category)
    .single()

  const itemsByTier: ItemsByTier = (tierListRow?.items_by_tier as ItemsByTier | null) ?? emptyItemsByTier()
  const updatedAt = tierListRow?.updated_at ?? null

  const allItemIds = TIER_ORDER.flatMap(t => itemsByTier[t] ?? [])
  if (allItemIds.length === 0) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-24">
          <div className="mb-6"><SiteHeader /></div>
          <p className="text-text-muted text-sm text-center mt-16">Cette tier list est vide ou n'existe pas.</p>
          <div className="text-center mt-4">
            <Link href="/tier-list" className="text-primary text-sm font-semibold hover:underline">← Retour</Link>
          </div>
        </div>
      </main>
    )
  }

  // Fetch item metadata for all ids
  const metaById: Record<string, ItemMeta> = {}

  if (category === 'experiences-mine' || category === 'experiences-all') {
    const { data } = await supabase
      .from('experiences')
      .select('id, title, cover_image_url, venue_name')
      .in('id', allItemIds)
    for (const e of (data ?? []) as Pick<Experience, 'id' | 'title' | 'cover_image_url' | 'venue_name'>[]) {
      metaById[e.id] = { id: e.id, name: e.title, photo: e.cover_image_url, subtitle: e.venue_name }
    }
  } else if (category === 'lieux') {
    const { data } = await supabase.from('lieux').select('id, name, photo_url, lieu_type').in('id', allItemIds)
    for (const l of (data ?? []) as Pick<Lieu, 'id' | 'name' | 'photo_url' | 'lieu_type'>[]) {
      metaById[l.id] = { id: l.id, name: l.name, photo: l.photo_url, subtitle: l.lieu_type }
    }
  } else {
    const { data } = await supabase.from('fournisseurs').select('id, name, photo_url, category').in('id', allItemIds)
    for (const f of (data ?? []) as Pick<Fournisseur, 'id' | 'name' | 'photo_url' | 'category'>[]) {
      metaById[f.id] = { id: f.id, name: f.name, photo: f.photo_url, subtitle: f.category }
    }
  }

  const displayName = profile.display_name ?? username

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24">

        <div className="mb-6"><SiteHeader /></div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/tier-list" className="text-text-muted hover:text-text text-sm transition-colors">← Tier List</Link>
          </div>
          <h1 className="font-display font-bold text-2xl text-text">
            La tier list de {displayName}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {TIER_CATEGORY_LABELS[category]}
            {updatedAt && ` · ${new Date(updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        </div>

        {/* Tier rows — read only */}
        <div className="flex flex-col gap-4">
          {TIER_ORDER.filter(t => (itemsByTier[t]?.length ?? 0) > 0).map(tier => {
            const cfg = TIER_CONFIG[tier]
            const items = (itemsByTier[tier] ?? []).map(id => metaById[id]).filter(Boolean) as ItemMeta[]

            return (
              <div key={tier} className="flex gap-3">
                <div className="shrink-0 w-10 flex items-start justify-center pt-2">
                  <span className={`font-display font-bold text-2xl ${cfg.color}`}>{tier}</span>
                </div>
                <div className={`flex-1 rounded-xl border-2 p-2 flex flex-col gap-1.5 ${cfg.bg} border-border`}>
                  {items.map(meta => (
                    <div key={meta.id} className="flex items-center gap-2 bg-bg/80 border border-border/50 rounded-lg px-2 py-1.5">
                      {meta.photo ? (
                        <img src={meta.photo} alt={meta.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm shrink-0">
                          {meta.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text leading-tight truncate">{meta.name}</p>
                        {meta.subtitle && <p className="text-[10px] text-text-muted truncate">{meta.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-primary/5 border border-primary/15 rounded-2xl p-5 text-center">
          <p className="font-display font-semibold text-text mb-1">Et toi, quel est ton classement ?</p>
          <p className="text-text-muted text-sm mb-4">Crée ta propre tier list et compare avec la communauté.</p>
          <Link
            href={`/tier-list/mienne?cat=${category}`}
            className="inline-block bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Créer ma tier list →
          </Link>
        </div>

      </div>
    </main>
  )
}
