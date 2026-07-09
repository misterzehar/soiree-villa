// Centralized fallback image system.
// When cover_image_url / photo_url is null in the database,
// we surface a curated stock photo matched to the entity's type/category
// instead of a gray placeholder — the Ghost-Only Rule extended to imagery.

export const FALLBACK_EXPERIENCE = '/fallback-experience.jpg'
export const OBSESSION_DEFAULT = '/obsession-default.jpg'

const LIEU_FALLBACKS: Record<string, string> = {
  bar:        '/fallback-bar.jpg',
  restaurant: '/fallback-restaurant.jpg',
  salle:      '/fallback-salle.jpg',
  atelier:    '/fallback-atelier.jpg',
  rooftop:    '/fallback-rooftop.jpg',
  plein_air:  '/fallback-plein-air.jpg',
  autre:      '/fallback-salle.jpg',
}

const FOURNISSEUR_FALLBACKS: Record<string, string> = {
  traiteur:   '/fallback-fournisseur-traiteur.jpg',
  dj_musique: '/fallback-fournisseur-dj-musique.jpg',
  deco:       '/fallback-fournisseur-deco.jpg',
  animation:  '/fallback-fournisseur-animation.jpg',
}

export function getLieuFallback(lieuType: string | null | undefined): string {
  if (!lieuType) return '/fallback-salle.jpg'
  return LIEU_FALLBACKS[lieuType] ?? '/fallback-salle.jpg'
}

export function getFournisseurFallback(category: string | null | undefined): string {
  if (!category) return '/fallback-fournisseur-animation.jpg'
  return FOURNISSEUR_FALLBACKS[category] ?? '/fallback-fournisseur-animation.jpg'
}
