export type PricingTier = {
  id: 'early' | 'standard' | 'last'
  label: string
  quantity: number
  price_cents: number
}

export type MenuSocialAct = {
  phase: 'Comprendre' | 'Vivre' | 'Oser'
  label: string
  description: string
  duration_minutes: number
}

export type MenuSocial = {
  entree: MenuSocialAct
  plat: MenuSocialAct
  dessert: MenuSocialAct
}

export type Experience = {
  id: string
  title: string
  description: string
  menu_social: MenuSocial
  venue_name: string
  venue_ambiance: string
  date: string
  duration_minutes: number
  pricing_tiers: PricingTier[]
  capacity_max: number
  capacity_current: number
  cover_image_url: string | null
  compatible_profiles: string[]
  organizer_name: string
  organizer_bio: string | null
  organizer_id: string | null
  venue_id: string | null
  status: string
  created_at: string
}

export type CurrentTierInfo = {
  tier: PricingTier
  placesRestantes: number
  nextTier: PricingTier | null
  isSoldOut: false
} | {
  isSoldOut: true
}
