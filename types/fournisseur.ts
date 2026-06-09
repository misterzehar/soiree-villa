export type FournisseurCategory = 'traiteur' | 'dj_musique' | 'deco' | 'animation'

export type Fournisseur = {
  id: string
  name: string
  slug: string
  category: FournisseurCategory
  city: string
  description: string | null
  photo_url: string | null
  axes_scores: Record<string, number>
  price_range: string | null
  website_url: string | null
  is_approved: boolean
  claimed_by_user_id: string | null
  created_at: string
}

export const FOURNISSEUR_CATEGORY_LABELS: Record<FournisseurCategory, string> = {
  traiteur:   'Traiteur',
  dj_musique: 'DJ / Musique',
  deco:       'Décoration',
  animation:  'Animation / Animation événementielle',
}
