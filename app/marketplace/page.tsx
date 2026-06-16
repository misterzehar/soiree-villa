import Link from 'next/link'
import { Search, Star, MapPin } from 'lucide-react'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Lieu } from '@/types/lieu'
import type { Fournisseur, FournisseurCategory } from '@/types/fournisseur'
import { matchScore } from '@/lib/matching'
import type { AxesTarget } from '@/constants/profiles'

export const dynamic = 'force-dynamic'

type MarketplaceItem = {
  id: string
  type: 'lieu' | 'fournisseur'
  slug: string
  name: string
  city: string
  photo_url: string | null
  subtitle: string
  avgRating: number
  reviewCount: number
  score: number | null
}

const LIEU_TYPE_LABELS: Record<string, string> = {
  salle: 'Salle', rooftop: 'Rooftop', plein_air: 'Plein air',
  bar: 'Bar', restaurant: 'Restaurant', atelier: 'Atelier', autre: 'Autre',
}

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'lieu', label: 'Lieux' },
  { value: 'fournisseur', label: 'Prestataires' },
]

const CATEGORY_OPTIONS = Object.entries(FOURNISSEUR_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; category?: string; city?: string }>
}) {
  const { q = '', type = '', category = '', city = '' } = await searchParams

  const cookieStore = await cookies()
  const axesCookie = cookieStore.get('sv_axes')
  let userAxes: AxesTarget | null = null
  if (axesCookie) {
    try { userAxes = JSON.parse(axesCookie.value) } catch {}
  }

  const supabase = createServerSupabase()

  const [{ data: lieuxData }, { data: fournsData }, { data: lieuxReviews }, { data: fournsReviews }] =
    await Promise.all([
      supabase.from('lieux').select('*').eq('is_approved', true).order('name'),
      supabase.from('fournisseurs').select('*').eq('is_approved', true).order('name'),
      supabase.from('reviews').select('target_id, rating').eq('target_type', 'lieu').eq('is_published', true),
      supabase.from('reviews').select('target_id, rating').eq('target_type', 'fournisseur').eq('is_published', true),
    ])

  function buildRatingMap(rows: { target_id: string; rating: number }[] | null) {
    const map: Record<string, { sum: number; count: number }> = {}
    for (const r of rows ?? []) {
      if (!map[r.target_id]) map[r.target_id] = { sum: 0, count: 0 }
      map[r.target_id].sum += r.rating
      map[r.target_id].count++
    }
    return map
  }

  const lieuxRatings  = buildRatingMap(lieuxData ? (lieuxReviews ?? []) : [])
  const fournsRatings = buildRatingMap(fournsData ? (fournsReviews ?? []) : [])

  const items: MarketplaceItem[] = []

  function toAxesTarget(axesScores: Record<string, number> | null | undefined): AxesTarget {
    const safe = axesScores ?? {}
    const clamp = (v: number | undefined): -1 | 0 | 1 =>
      v === undefined || v === null ? 0 : v > 0 ? 1 : v < 0 ? -1 : 0
    return {
      energy:     clamp(safe.energy),
      structure:  clamp(safe.structure),
      depth:      clamp(safe.depth),
      sociality:  clamp(safe.sociality),
      cerebrale:  clamp(safe.cerebrale),
      creativite: clamp(safe.creativite),
    }
  }

  if (type !== 'fournisseur') {
    for (const l of (lieuxData ?? []) as Lieu[]) {
      const r = lieuxRatings[l.id]
      const avgRating = r ? Math.round(r.sum / r.count * 10) / 10 : 0
      items.push({
        id: l.id,
        type: 'lieu',
        slug: l.slug,
        name: l.name,
        city: l.city,
        photo_url: l.photo_url,
        subtitle: LIEU_TYPE_LABELS[l.lieu_type] ?? l.lieu_type,
        avgRating,
        reviewCount: r?.count ?? 0,
        score: userAxes ? matchScore(userAxes, toAxesTarget(l.axes_scores)) : null,
      })
    }
  }

  if (type !== 'lieu') {
    for (const f of (fournsData ?? []) as Fournisseur[]) {
      if (category && f.category !== category) continue
      const r = fournsRatings[f.id]
      const avgRating = r ? Math.round(r.sum / r.count * 10) / 10 : 0
      items.push({
        id: f.id,
        type: 'fournisseur',
        slug: f.slug,
        name: f.name,
        city: f.city,
        photo_url: f.photo_url,
        subtitle: FOURNISSEUR_CATEGORY_LABELS[f.category as FournisseurCategory],
        avgRating,
        reviewCount: r?.count ?? 0,
        score: userAxes ? matchScore(userAxes, toAxesTarget(f.axes_scores)) : null,
      })
    }
  }

  const filtered = items.filter(item => {
    if (city && !item.city.toLowerCase().includes(city.toLowerCase())) return false
    if (q && !item.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  if (userAxes) {
    filtered.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <h1 className="font-display font-bold text-2xl text-text mb-1">Marketplace</h1>
        <p className="text-text-muted text-sm mb-5">
          Lieux & prestataires partenaires de Soirée Villa
        </p>

        {/* Barre de recherche */}
        <form method="get" className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Rechercher…"
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {TYPE_FILTER_OPTIONS.map(opt => (
              <a
                key={opt.value}
                href={`/marketplace?q=${q}&type=${opt.value}&category=${category}&city=${city}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  type === opt.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface border-border text-text-muted hover:text-text'
                }`}
              >
                {opt.label}
              </a>
            ))}
            {type === 'fournisseur' && CATEGORY_OPTIONS.map(opt => (
              <a
                key={opt.value}
                href={`/marketplace?q=${q}&type=fournisseur&category=${opt.value}&city=${city}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === opt.value
                    ? 'bg-primary/15 text-primary border-primary/40'
                    : 'bg-surface border-border text-text-muted hover:text-text'
                }`}
              >
                {opt.label}
              </a>
            ))}
          </div>
        </form>

        <p className="text-text-muted text-xs mb-4">
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          {userAxes ? ' · triés par compatibilité' : ''}
        </p>

        {filtered.length === 0 ? (
          <p className="text-text-muted text-sm">Aucun résultat pour cette recherche.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <Link
                key={`${item.type}-${item.id}`}
                href={`/${item.type === 'lieu' ? 'lieux' : 'fournisseurs'}/${item.slug}`}
                className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-4 p-4"
              >
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-bg flex items-center justify-center text-2xl shrink-0">
                    {item.type === 'lieu' ? '🏠' : '🎵'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-text text-sm leading-snug">{item.name}</p>
                      <p className="text-text-muted text-xs mt-0.5">{item.subtitle}</p>
                    </div>
                    {item.score !== null && (
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.score >= 80 ? 'bg-success/15 text-success' :
                        item.score >= 60 ? 'bg-primary/15 text-primary' :
                        'bg-border/50 text-text-muted'
                      }`}>
                        {item.score}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-text-muted text-xs">
                      <MapPin className="w-3 h-3" />
                      {item.city}
                    </span>
                    {item.reviewCount > 0 && (
                      <span className="flex items-center gap-1 text-text-muted text-xs">
                        <Star className="w-3 h-3 fill-warning text-warning" />
                        {item.avgRating} ({item.reviewCount})
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
