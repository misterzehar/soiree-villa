import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { getCity } from '@/lib/city'
import { fetchCommunitySnapshot, TIER_CATEGORY_LABELS, computeCommunitySnapshot, type TierCategory, type ItemsByTier } from '@/lib/community-tier'
import { TIER_CONFIG, type TierLabel } from '@/lib/tier'
import { SiteHeader } from '@/components/site-header'
import { TierListNav } from '@/components/tier-maker/tier-list-nav'
import type { Experience } from '@/types/experience'
import type { Lieu } from '@/types/lieu'
import type { Fournisseur } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES: TierCategory[] = ['experiences-mine', 'experiences-all', 'lieux', 'fournisseurs']
const TIER_ORDER: TierLabel[] = ['S', 'A', 'B', 'C', 'D']

type ItemMeta = { id: string; name: string; photo: string | null; subtitle?: string }

export default async function CommunauteTierPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: catParam } = await params
  if (!VALID_CATEGORIES.includes(catParam as TierCategory)) notFound()
  const category = catParam as TierCategory

  const cookieStore = await cookies()
  const city = getCity(cookieStore)
  const supabase = createServerSupabase()

  // Try stored snapshot first
  let snapshot = await fetchCommunitySnapshot(supabase, category)

  // If no snapshot stored yet, compute live from user_tier_lists
  if (Object.keys(snapshot).length === 0) {
    const { data } = await supabase
      .from('user_tier_lists')
      .select('items_by_tier')
      .eq('category', category)

    if (data && data.length > 0) {
      const computed = computeCommunitySnapshot(data as { items_by_tier: ItemsByTier }[])
      snapshot = computed
    }
  }

  // Count total voters
  const { count: voterCount } = await supabase
    .from('user_tier_lists')
    .select('id', { count: 'exact', head: true })
    .eq('category', category)

  // Fetch item metadata based on category
  const now = new Date().toISOString()
  let allMeta: ItemMeta[] = []

  if (category === 'experiences-mine' || category === 'experiences-all') {
    const query = supabase
      .from('experiences')
      .select('id, title, cover_image_url, venue_name')
      .eq('status', 'published')
      .eq('city', city)
    const { data } = category === 'experiences-mine'
      ? await query.lt('date', now)
      : await query
    allMeta = ((data ?? []) as Pick<Experience, 'id' | 'title' | 'cover_image_url' | 'venue_name'>[]).map(e => ({
      id: e.id, name: e.title, photo: e.cover_image_url, subtitle: e.venue_name,
    }))
  } else if (category === 'lieux') {
    const { data } = await supabase.from('lieux').select('id, name, photo_url, lieu_type').eq('is_approved', true).eq('city', city)
    allMeta = ((data ?? []) as Pick<Lieu, 'id' | 'name' | 'photo_url' | 'lieu_type'>[]).map(l => ({
      id: l.id, name: l.name, photo: l.photo_url, subtitle: l.lieu_type,
    }))
  } else {
    const { data } = await supabase.from('fournisseurs').select('id, name, photo_url, category').eq('is_approved', true).eq('city', city)
    allMeta = ((data ?? []) as Pick<Fournisseur, 'id' | 'name' | 'photo_url' | 'category'>[]).map(f => ({
      id: f.id, name: f.name, photo: f.photo_url, subtitle: f.category,
    }))
  }

  const metaById: Record<string, ItemMeta> = {}
  for (const m of allMeta) metaById[m.id] = m

  // Group by tier
  const byTier: Record<TierLabel, Array<{ meta: ItemMeta; avgScore: number; voteCount: number }>> = {
    S: [], A: [], B: [], C: [], D: [],
  }
  for (const [itemId, { tier, avgScore, voteCount }] of Object.entries(snapshot)) {
    const meta = metaById[itemId]
    if (!meta) continue
    byTier[tier as TierLabel].push({ meta, avgScore, voteCount })
  }
  for (const t of TIER_ORDER) {
    byTier[t].sort((a, b) => b.avgScore - a.avgScore)
  }

  const hasData = Object.values(byTier).some(arr => arr.length > 0)

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24">

        <div className="mb-6">
          <SiteHeader />
        </div>

        <h1 className="font-display font-bold text-2xl text-text mb-1">Tier List — {city}</h1>
        <p className="text-text-muted text-sm mb-1">
          {TIER_CATEGORY_LABELS[category]} · {(voterCount ?? 0)} vote{(voterCount ?? 0) > 1 ? 's' : ''} · mis à jour chaque nuit
        </p>

        <TierListNav active="communaute" />

        {/* Category tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 mb-6 scrollbar-hide">
          {VALID_CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/tier-list/communaute/${cat}`}
              className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                cat === category
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface border-border text-text-muted hover:text-text'
              }`}
            >
              {TIER_CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>

        {!hasData ? (
          <div className="bg-surface rounded-2xl p-8 text-center border border-border">
            <p className="text-3xl mb-3">🤝</p>
            <p className="font-display font-semibold text-text mb-1">Pas encore de votes</p>
            <p className="text-text-muted text-sm mb-4">
              Sois le premier à créer ta tier list pour alimenter le classement communautaire.
            </p>
            <Link
              href={`/tier-list/mienne?cat=${category}`}
              className="inline-block text-sm bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Créer ma tier list →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {TIER_ORDER.filter(t => byTier[t].length > 0).map(tier => {
              const cfg = TIER_CONFIG[tier]
              return (
                <section key={tier}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`font-display font-bold text-3xl ${cfg.color}`}>{tier}</span>
                    <span className="text-text-muted text-xs">{byTier[tier].length} élément{byTier[tier].length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {byTier[tier].map(({ meta, avgScore, voteCount }) => (
                      <div
                        key={meta.id}
                        className={`flex items-center gap-3 bg-surface rounded-xl p-3 border ${cfg.bg} border-border`}
                      >
                        {meta.photo ? (
                          <img src={meta.photo} alt={meta.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center text-base shrink-0">
                            {meta.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-text text-sm truncate">{meta.name}</p>
                          {meta.subtitle && <p className="text-text-muted text-xs truncate">{meta.subtitle}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-bold text-sm ${cfg.color}`}>{avgScore.toFixed(1)}</p>
                          <p className="text-text-muted text-[10px]">{voteCount} vote{voteCount > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/tier-list/mienne?cat=${category}`}
            className="inline-block text-sm text-primary font-semibold hover:underline"
          >
            Voter avec ma tier list →
          </Link>
        </div>

      </div>
    </main>
  )
}
