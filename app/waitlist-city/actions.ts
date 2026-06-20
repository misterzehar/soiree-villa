'use server'

import { createServerSupabase } from '@/lib/supabase'
import { SUPPORTED_CITIES, type SupportedCity } from '@/constants/cities'
import { sendWaitlistCityEmail } from '@/lib/email'

export async function joinCityWaitlist(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const city  = formData.get('city')?.toString() as SupportedCity

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Adresse email invalide.' }
  }
  if (!(SUPPORTED_CITIES as readonly string[]).includes(city)) {
    return { error: 'Ville non supportée.' }
  }

  const supabase = createServerSupabase()
  const { error } = await supabase.from('waitlist_city').insert({ email, city })

  if (error && !error.message.toLowerCase().includes('unique')) {
    return { error: 'Une erreur est survenue. Réessaie.' }
  }

  try { await sendWaitlistCityEmail({ to: email, city }) } catch {}

  return { success: true }
}
