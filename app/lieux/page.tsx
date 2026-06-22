import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { getCity } from '@/lib/city'
import { CityWaitlistForm } from '@/components/city-waitlist-form'
import type { Lieu } from '@/types/lieu'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Lieux partenaires',
  description: 'Les lieux partenaires de Soirée Villa — rooftops, lofts, ateliers et espaces privatisables.',
  openGraph: {
    title: 'Lieux partenaires — Soirée Villa',
    description: 'Rooftops, lofts, ateliers — les espaces qui font les soirées mémorables.',
  },
}

const LIEU_TYPE_LABELS: Record<string, string> = {
  salle: 'Salle', rooftop: 'Rooftop', plein_air: 'Plein air',
  bar: 'Bar', restaurant: 'Restaurant', atelier: 'Atelier', autre: 'Autre',
}

export default async function LieuxPage() {
  const cookieStore = await cookies()
  const city = getCity(cookieStore)

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('lieux')
    .select('*')
    .eq('is_approved', true)
    .eq('city', city)
    .order('name')

  const lieux = (data ?? []) as Lieu[]

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">
        <h1 className="font-display font-bold text-2xl text-text mb-1">Nos lieux partenaires</h1>
        <p className="text-text-muted text-sm mb-6">
          {lieux.length} lieu{lieux.length > 1 ? 'x' : ''} disponible{lieux.length > 1 ? 's' : ''} à {city}
        </p>

        {lieux.length === 0 ? (
          <div className="bg-surface rounded-2xl p-6 text-center border border-border">
            <p className="text-3xl mb-3">🏠</p>
            <p className="font-display font-semibold text-text mb-1">Bientôt à {city} !</p>
            <p className="text-text-muted text-sm mb-5">
              Pas encore de lieux partenaires dans ta ville. Laisse ton email pour être prévenu·e en premier.
            </p>
            <CityWaitlistForm city={city} />
          </div>
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
