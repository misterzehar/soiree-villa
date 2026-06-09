'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function sendMagicLink(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email')?.toString().trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email invalide.' }
  }

  const supabase = await createSupabaseServerClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  const redirectTo = formData.get('redirect')?.toString() ?? '/compte'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      shouldCreateUser: true,
    },
  })

  if (error) return { error: 'Impossible d\'envoyer le lien. Réessaie dans quelques secondes.' }
  return {}
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}
