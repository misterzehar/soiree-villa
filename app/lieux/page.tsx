import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import type { Lieu } from '@/types/lieu'

export const dynamic = 'force-dynamic'

const LIEU_TYPE_LABELS: Record<string, string> = {
  salle: 'Salle', rooftop: 'Rooftop', plein_air: 'Plein air',
  bar: 'Bar', restaurant: 'Restaurant', atelier: 'Atelier', autre: 'Autre',
}

export default async function LieuxPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('lieux')
    .select('*')
    .eq('is_approved', true)
    .order('name')

  const lieux = (data ?? []) as Lieu[]

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <h1 className="font-display font-bold text-2xl text-text mb-1">Nos lieux partenaires</h1>
        <p className="text-text-muted text-sm mb-6">
          {lieux.length} lieu{lieux.length > 1 ? 'x' : ''} disponible{lieux.length > 1 ? 's' : ''} à Nice
        </p>

        {lieux.length === 0 ? (
          <p className="text-text-muted text-sm">Aucun lieu disponible pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lieux.map(lieu => (
              <Link
                key={lieu.id}
                href={`/lieux/${lieu.slug}`}
                className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
              >
                {lieu.photo_url ? (
                  <img src={lieu.photo_url} alt={lieu.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-bg flex items-center justify-center text-2xl shrink-0">🏠</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-text">{lieu.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {LIEU_TYPE_LABELS[lieu.lieu_type] ?? lieu.lieu_type}
                    {lieu.capacity ? ` · ${lieu.capacity} pers.` : ''}
                  </p>
                  {lieu.ambiance && (
                    <p className="text-text-muted text-xs mt-1 line-clamp-2 italic">{lieu.ambiance}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
