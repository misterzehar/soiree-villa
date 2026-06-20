'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { SUPPORTED_CITIES, type SupportedCity } from '@/constants/cities'

export async function updatePreferredCity(formData: FormData): Promise<void> {
  const city = formData.get('city')?.toString() as SupportedCity
  if (!(SUPPORTED_CITIES as readonly string[]).includes(city)) return

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return

  const supabase = createServerSupabase()
  await supabase.from('profiles').update({ preferred_city: city }).eq('id', user.id)
  revalidatePath('/compte')
}
