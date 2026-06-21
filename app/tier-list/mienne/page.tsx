import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createSupabaseServerClient, createServerSupabase } from '@/lib/supabase'
import { getCity } from '@/lib/city'
import { TIER_CATEGORY_LABELS, type TierCategory, type ItemsByTier, emptyItemsByTier } from '@/lib/community-tier'
import { TierMakerEditor } from '@/components/tier-maker/tier-maker-editor'
import { TierListNav } from '@/components/tier-maker/tier-list-nav'
import { SiteHeader } from '@/components/site-header'
import type { TierItemData } from '@/components/tier-maker/tier-item'
import type { Experience } from '@/types/experience'
import type { Lieu } from '@/types/lieu'
import type { Fournisseur } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Ma Tier List — Soirée Villa',
}

const VALID_CATEGORIES: TierCategory[] = ['experiences-mine', 'experiences-all', 'lieux', 'fournisseurs']

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

export default async function MaTierListPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string | string[] }>
}) {
  const sp = await searchParams
  const catRaw = firstParam(sp.cat)
  const category: TierCategory = VALID_CATEGORIES.includes(catRaw as TierCategory)
    ? (catRaw as TierCategory)
    : 'experiences-mine'

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?from=/tier-list/mienne')

  const cookieStore = await cookies()
  const city = getCity(cookieStore)

  const supabase = createServerSupabase()
  const now = new Date().toISOString()

  // Load existing tier list for this category
  const { data: existingRow } = await supabase
    .from('user_tier_lists')
    .select('items_by_tier')
    .eq('user_id', user.id)
    .eq('category', category)
    .single()
  const savedItemsByTier = (existingRow?.items_by_tier as ItemsByTier | null) ?? emptyItemsByTier()

  // Load user display_name for share URL
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()
  const username = encodeURIComponent(profileRow?.display_name ?? user.id)

  // Fetch items based on category
  let allItems: TierItemData[] = []

  if (category === 'experiences-mine') {
    // Past paid registrations for this user
    const { data: regs } = await supabase
      .from('registrations')
      .select('experiences(id, title, cover_image_url, venue_name, date)')
      .eq('participant_email', user.email!)
      .eq('payment_status', 'paid')
      .lt('experiences.date', now)

    const seen = new Set<string>()
    for (const r of regs ?? []) {
      const exp = Array.isArray(r.experiences) ? r.experiences[0] : r.experiences
      if (!exp || seen.has(exp.id)) continue
      seen.add(exp.id)
      allItems.push({
        id: exp.id,
        name: exp.title,
        photo: exp.cover_image_url,
        subtitle: new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      })
    }
  } else if (category === 'experiences-all') {
    const { data } = await supabase
      .from('experiences')
      .select('id, title, cover_image_url, venue_name')
      .eq('status', 'published')
      .eq('city', city)
      .order('date', { ascending: false })

    allItems = ((data ?? []) as Pick<Experience, 'id' | 'title' | 'cover_image_url' | 'venue_name'>[]).map(e => ({
      id: e.id,
      name: e.title,
      photo: e.cover_image_url,
      subtitle: e.venue_name,
    }))
  } else if (category === 'lieux') {
    const { data } = await supabase
      .from('lieux')
      .select('id, name, photo_url, lieu_type')
      .eq('is_approved', true)
      .eq('city', city)
      .order('name')

    allItems = ((data ?? []) as Pick<Lieu, 'id' | 'name' | 'photo_url' | 'lieu_type'>[]).map(l => ({
      id: l.id,
      name: l.name,
      photo: l.photo_url,
      subtitle: l.lieu_type,
    }))
  } else {
    const { data } = await supabase
      .from('fournisseurs')
      .select('id, name, photo_url, category')
      .eq('is_approved', true)
      .eq('city', city)
      .order('name')

    allItems = ((data ?? []) as Pick<Fournisseur, 'id' | 'name' | 'photo_url' | 'category'>[]).map(f => ({
      id: f.id,
      name: f.name,
      photo: f.photo_url,
      subtitle: f.category,
    }))
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soireevilla.com'}/tier-list/${username}/${category}`

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24">

        <div className="mb-6">
          <SiteHeader />
        </div>

        <h1 className="font-display font-bold text-2xl text-text mb-1">Tier List — {city}</h1>
        <p className="text-text-muted text-sm mb-6">Classe par drag & drop · sauvegarde automatique</p>

        <TierListNav active="mienne" />

        {/* Category tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 mb-6 scrollbar-hide">
          {VALID_CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/tier-list/mienne?cat=${cat}`}
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

        {allItems.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center border border-border">
            <p className="text-3xl mb-3">🏆</p>
            <p className="font-display font-semibold text-text mb-1">
              {category === 'experiences-mine'
                ? 'Pas encore de soirées vécues'
                : `Aucun élément disponible à ${city}`}
            </p>
            <p className="text-text-muted text-sm">
              {category === 'experiences-mine'
                ? 'Participe à une soirée pour commencer ta tier list !'
                : 'Reviens plus tard ou change de ville.'}
            </p>
            {category === 'experiences-mine' && (
              <Link
                href="/experiences"
                className="inline-block mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Voir les soirées →
              </Link>
            )}
          </div>
        ) : (
          <TierMakerEditor
            category={category}
            allItems={allItems}
            initialItemsByTier={savedItemsByTier}
            publicUrl={publicUrl}
          />
        )}

      </div>
    </main>
  )
}
