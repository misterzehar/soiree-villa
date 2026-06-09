import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, ExternalLink } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import type { Lieu } from '@/types/lieu'

const AXIS_LABELS: Record<string, { low: string; high: string; icon: string }> = {
  energy:    { low: 'Calme',       high: 'Dynamique',   icon: '⚡' },
  structure: { low: 'Libre',       high: 'Structuré',   icon: '🗂' },
  depth:     { low: 'Légèreté',    high: 'Profondeur',  icon: '💎' },
  sociality: { low: 'Intimiste',   high: 'Grand groupe',icon: '👥' },
}

const LIEU_TYPE_LABELS: Record<string, string> = {
  salle: 'Salle', rooftop: 'Rooftop', plein_air: 'Plein air',
  bar: 'Bar', restaurant: 'Restaurant', atelier: 'Atelier', autre: 'Autre',
}

export default async function LieuFichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServerSupabase()

  const { data } = await supabase
    .from('lieux')
    .select('*')
    .eq('slug', slug)
    .eq('is_approved', true)
    .single()

  if (!data) notFound()

  const lieu = data as Lieu

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <Link
          href="/lieux"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les lieux
        </Link>

        {lieu.photo_url && (
          <img
            src={lieu.photo_url}
            alt={lieu.name}
            className="w-full h-48 object-cover rounded-2xl mb-5"
          />
        )}

        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-display font-bold text-2xl text-text">{lieu.name}</h1>
          <span className="text-xs bg-bg border border-border rounded-full px-2.5 py-1 text-text-muted shrink-0">
            {LIEU_TYPE_LABELS[lieu.lieu_type] ?? lieu.lieu_type}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-text-muted text-sm mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {lieu.city}{lieu.address ? ` · ${lieu.address}` : ''}
          </span>
          {lieu.capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {lieu.capacity} personnes max
            </span>
          )}
        </div>

        {lieu.ambiance && (
          <p className="text-text-muted text-sm italic mb-5">{lieu.ambiance}</p>
        )}

        {/* Axes */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-base text-text mb-4">Profil du lieu</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(AXIS_LABELS).map(([axis, labels]) => {
              const score = lieu.axes_scores[axis] ?? 0
              const isHigh = score > 0
              return (
                <div key={axis} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{labels.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>{labels.low}</span>
                      <span>{labels.high}</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${isHigh ? 75 : 25}%`, marginLeft: isHigh ? '25%' : undefined }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {lieu.website_url && (
          <a
            href={lieu.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visiter le site
          </a>
        )}

      </div>
    </main>
  )
}
