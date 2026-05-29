import type { Experience, CurrentTierInfo } from '@/types/experience'

export function getCurrentTierInfo(experience: Experience): CurrentTierInfo {
  const sold = experience.capacity_current
  let cumulative = 0

  for (let i = 0; i < experience.pricing_tiers.length; i++) {
    const tier = experience.pricing_tiers[i]
    cumulative += tier.quantity
    if (sold < cumulative) {
      const placesRestantes = cumulative - sold
      const nextTier = experience.pricing_tiers[i + 1] ?? null
      return { tier, placesRestantes, nextTier, isSoldOut: false }
    }
  }

  return { isSoldOut: true }
}

export function formatPrice(price_cents: number): string {
  return `${Math.round(price_cents / 100)} €`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}
