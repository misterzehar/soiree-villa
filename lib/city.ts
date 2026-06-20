import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { SUPPORTED_CITIES, DEFAULT_CITY, type SupportedCity } from '@/constants/cities'

export function getCity(cookieStore: ReadonlyRequestCookies): SupportedCity {
  const raw = cookieStore.get('sv_city')?.value
  return (SUPPORTED_CITIES as readonly string[]).includes(raw ?? '')
    ? (raw as SupportedCity)
    : DEFAULT_CITY
}
