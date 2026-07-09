import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { getCity } from '@/lib/city'
import { CityWaitlistForm } from '@/components/city-waitlist-form'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Fournisseur, FournisseurCategory } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Prestataires partenaires',
  description: 'DJ, traiteurs, décoration, animation — les prestataires qui font les soirées Soirée Villa.',
  openGraph: {
    title: 'Prestataires partenaires — Soirée Villa',
    description: 'DJ, traiteurs, déco et animation au service des meilleures soirées.',
  },
}

export default async function FournisseursPage() {
  const cookieStore = await cookies()
  const city = getCity(cookieStore)

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('is_approved', true)
    .eq('city', city)
    .order('category')
    .order('name')

  const fournisseurs = (data ?? []) as Fournisseur[]

  const byCategory = fournisseurs.reduce<Record<string, Fournisseur[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <h1 className="font-display font-bold text-2xl text-text mb-1">Nos prestataires partenaires</h1>
        <p className="text-text-muted text-sm mb-6">
          {fournisseurs.length} prestataire{fournisseurs.length > 1 ? 's' : ''} à {city}
        </p>

        {fournisseurs.length === 0 ? (
          <div className="bg-surface rounded-2xl p-6 text-center border border-border">
            <p className="text-3xl mb-3">🎪</p>
            <p className="font-display font-semibold text-text mb-1">Bientôt à {city} !</p>
            <p className="text-text-muted text-sm mb-5">
              Pas encore de prestataires dans ta ville. Laisse ton email pour être prévenu·e en premier.
            </p>
            <CityWaitlistForm city={city} />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {(Object.entries(byCategory) as [FournisseurCategory, Fournisseur[]][]).map(([cat, items]) => (
              <section key={cat}>
                <h2 className="font-display font-semibold text-base text-text mb-3">
                  {FOURNISSEUR_CATEGORY_LABELS[cat]}
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map(f => (
                    <Link
                      key={f.id}
                      href={`/fournisseurs/${f.slug}`}
                      className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="font-display font-semibold text-text">{f.name}</p>
                      <p className="text-text-muted text-xs mt-0.5">{f.city}{f.price_range ? ` · ${f.price_range}` : ''}</p>
                      {f.description && (
                        <p className="text-text-muted text-xs mt-1 line-clamp-2">{f.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
