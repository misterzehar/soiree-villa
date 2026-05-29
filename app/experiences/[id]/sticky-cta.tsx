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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border px-4 py-4">
      <div className="max-w-md mx-auto">
        {!isSoldOut ? (
          <>
            <Link
              href={`/experiences/${experience.id}/register`}
              className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-2xl shadow-md transition-colors duration-150"
            >
              Je participe — {formatPrice(tierInfo.tier.price_cents)}
            </Link>
            <p className="text-center text-text-muted text-xs mt-2">
              {tierInfo.tier.label} — {tierInfo.placesRestantes} place{tierInfo.placesRestantes > 1 ? 's' : ''} restante{tierInfo.placesRestantes > 1 ? 's' : ''}
            </p>
          </>
        ) : (
          <button
            disabled
            className="block w-full text-center bg-border text-text-muted font-display font-semibold py-4 rounded-2xl cursor-not-allowed"
          >
            Complet
          </button>
        )}
      </div>
    </div>
  )
}
