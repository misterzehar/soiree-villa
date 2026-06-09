import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Fournisseur } from '@/types/fournisseur'

export const dynamic = 'force-dynamic'

const AXIS_LABELS: Record<string, { low: string; high: string; icon: string }> = {
  energy:    { low: 'Calme',       high: 'Dynamique',   icon: '⚡' },
  structure: { low: 'Libre',       high: 'Structuré',   icon: '🗂' },
  depth:     { low: 'Légèreté',    high: 'Profondeur',  icon: '💎' },
  sociality: { low: 'Petit groupe',high: 'Grand groupe',icon: '👥' },
}

export default async function FournisseurFichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServerSupabase()

  const { data } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('slug', slug)
    .eq('is_approved', true)
    .single()

  if (!data) notFound()

  const f = data as Fournisseur

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <Link
          href="/fournisseurs"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les prestataires
        </Link>

        {f.photo_url && (
          <img
            src={f.photo_url}
            alt={f.name}
            className="w-full h-40 object-cover rounded-2xl mb-5"
          />
        )}

        <p className="text-primary text-xs font-semibold uppercase tracking-wide mb-1">
          {FOURNISSEUR_CATEGORY_LABELS[f.category]}
        </p>
        <h1 className="font-display font-bold text-2xl text-text mb-1">{f.name}</h1>
        <p className="text-text-muted text-sm mb-4">{f.city}</p>

        {f.description && (
          <p className="text-text text-sm leading-relaxed mb-5">{f.description}</p>
        )}

        {f.price_range && (
          <div className="bg-surface rounded-2xl px-5 py-4 mb-5">
            <p className="text-text-muted text-xs mb-1">Fourchette de prix</p>
            <p className="text-text font-semibold">💰 {f.price_range}</p>
          </div>
        )}

        {/* Axes */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-base text-text mb-4">Profil prestataire</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(AXIS_LABELS).map(([axis, labels]) => {
              const score = f.axes_scores[axis] ?? 0
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
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${isHigh ? 75 : 25}%`, marginLeft: isHigh ? '25%' : undefined }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {f.website_url && (
          <a
            href={f.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Contacter / Voir le portfolio
          </a>
        )}

      </div>
    </main>
  )
}
