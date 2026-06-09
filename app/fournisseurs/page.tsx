import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Fournisseur, FournisseurCategory } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

export default async function FournisseursPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('is_approved', true)
    .order('category')
    .order('name')

  const fournisseurs = (data ?? []) as Fournisseur[]

  // Groupe par catégorie
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
          {fournisseurs.length} prestataire{fournisseurs.length > 1 ? 's' : ''} à Nice
        </p>

        {fournisseurs.length === 0 ? (
          <p className="text-text-muted text-sm">Aucun prestataire disponible pour l&apos;instant.</p>
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
