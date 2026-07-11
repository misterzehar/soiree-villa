'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'
import type { Experience, CurrentTierInfo } from '@/types/experience'

export function StickyCtaBar({
  experience,
  tierInfo,
}: {
  experience: Experience
  tierInfo: CurrentTierInfo
}) {
  const isSoldOut = tierInfo.isSoldOut

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-canvas/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-6 py-4">

        {/* Gauche — prix compact + info palier */}
        <div className="min-w-0">
          {!isSoldOut ? (
            <>
              <p className="font-display font-medium text-gold text-2xl leading-none">
                {formatPrice(tierInfo.tier.price_cents)}
              </p>
              <p className="text-white/60 text-xs mt-1 truncate">
                {tierInfo.tier.label} · {tierInfo.placesRestantes} place{tierInfo.placesRestantes > 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <p className="text-white/40 text-sm">Plus de places disponibles</p>
          )}
        </div>

        {/* Droite — CTA Ghost Doré */}
        {!isSoldOut ? (
          <Link
            href={`/experiences/${experience.id}/register`}
            className="shrink-0 inline-flex items-center gap-3 border border-gold/60 bg-transparent text-gold font-medium tracking-[0.15em] uppercase text-sm px-6 py-3.5 md:px-8 md:py-4 hover:bg-gold/10 hover:border-gold focus-visible:border-gold focus-visible:bg-gold/15 focus-visible:outline-none transition-colors duration-300"
          >
            Réserver ma place
            <span aria-hidden="true" className="tracking-normal normal-case">→</span>
          </Link>
        ) : (
          <button
            disabled
            className="shrink-0 border border-white/10 text-white/30 font-medium tracking-[0.15em] uppercase text-sm px-6 py-3.5 md:px-8 md:py-4 cursor-not-allowed"
          >
            Complet
          </button>
        )}

      </div>
    </div>
  )
}
