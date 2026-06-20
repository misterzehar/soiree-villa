'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SUPPORTED_CITIES, DEFAULT_CITY, CITY_COORDS, type SupportedCity } from '@/constants/cities'

function distKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestCity(lat: number, lon: number): SupportedCity {
  let best: SupportedCity = DEFAULT_CITY
  let bestDist = Infinity
  for (const [city, coords] of Object.entries(CITY_COORDS) as [SupportedCity, { lat: number; lon: number }][]) {
    const d = distKm(lat, lon, coords.lat, coords.lon)
    if (d < bestDist) { bestDist = d; best = city }
  }
  return best
}

function setCityCookie(city: SupportedCity) {
  document.cookie = `sv_city=${city}; path=/; max-age=31536000; SameSite=Lax`
}

function readCityCookie(): SupportedCity | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)sv_city=([^;]+)/)
  const val = match?.[1]
  return (SUPPORTED_CITIES as readonly string[]).includes(val ?? '') ? (val as SupportedCity) : null
}

type Props = {
  initialCity: SupportedCity
  variant?: 'light' | 'dark'
}

export function CitySelector({ initialCity, variant = 'light' }: Props) {
  const router = useRouter()
  const [city, setCity] = useState<SupportedCity>(initialCity)

  useEffect(() => {
    const existing = readCityCookie()
    if (existing) {
      if (existing !== city) setCity(existing)
      return
    }
    // No cookie → try geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nearest = nearestCity(pos.coords.latitude, pos.coords.longitude)
          setCityCookie(nearest)
          setCity(nearest)
          router.refresh()
        },
        () => setCityCookie(DEFAULT_CITY),
        { timeout: 5000 },
      )
    } else {
      setCityCookie(DEFAULT_CITY)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as SupportedCity
    setCityCookie(val)
    setCity(val)
    router.refresh()
  }

  const cls = variant === 'dark'
    ? 'text-white/80 hover:text-white bg-transparent border-white/25 focus:border-white/50'
    : 'text-text-muted hover:text-text bg-transparent border-border focus:border-primary'

  return (
    <select
      value={city}
      onChange={handleChange}
      aria-label="Choisir ma ville"
      className={`text-xs font-medium rounded-lg border px-2 py-1.5 focus:outline-none transition-colors cursor-pointer shrink-0 ${cls}`}
    >
      {SUPPORTED_CITIES.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  )
}
