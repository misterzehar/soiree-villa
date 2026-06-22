import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PROFILES } from '@/constants/profiles'
import { ResultAnimated } from '@/components/onboarding/result-animated'
import type { ProfileId, AxesTarget } from '@/constants/profiles'

export const metadata = {
  title: 'Ton profil social — Soirée Villa',
  description: 'Découvre ton profil social et les expériences qui te correspondent.',
}

export default async function ResultPage() {
  const cookieStore = await cookies()
  const profileId = cookieStore.get('sv_profile')?.value as ProfileId | undefined

  if (!profileId) redirect('/onboarding')

  const profile = PROFILES.find(p => p.id === profileId)
  if (!profile) redirect('/onboarding')

  let userAxes: AxesTarget = profile.axes_target
  const axesCookieRaw = cookieStore.get('sv_axes')?.value
  if (axesCookieRaw) {
    try {
      const parsed = JSON.parse(axesCookieRaw)
      if ('energy' in parsed) userAxes = parsed as AxesTarget
    } catch { /* fallback */ }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soireevilla.com'
  const shareUrl = `${siteUrl}/onboarding/result`

  return (
    <ResultAnimated
      profile={profile}
      userAxes={userAxes}
      shareUrl={shareUrl}
    />
  )
}
