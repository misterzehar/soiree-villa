export const SUPPORTED_CITIES = ['Nice', 'Marseille', 'Lyon', 'Paris'] as const
export type SupportedCity = typeof SUPPORTED_CITIES[number]
export const DEFAULT_CITY: SupportedCity = 'Nice'

export const CITY_COORDS: Record<SupportedCity, { lat: number; lon: number }> = {
  Nice:      { lat: 43.7102, lon:  7.2620 },
  Marseille: { lat: 43.2965, lon:  5.3698 },
  Lyon:      { lat: 45.7640, lon:  4.8357 },
  Paris:     { lat: 48.8566, lon:  2.3522 },
}
