'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

export async function createOrganizerProfile(
  formData: FormData,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/inscription')

  const displayName = formData.get('displayName')?.toString().trim() ?? ''
  const bio = formData.get('bio')?.toString().trim() ?? ''
  const organizerType = formData.get('organizerType')?.toString() ?? 'amateur'
  const city = formData.get('city')?.toString().trim() || 'Nice'

  if (displayName.length < 2) return { error: 'Nom trop court (2 caractères minimum).' }
  if (displayName.length > 60) return { error: 'Nom trop long (60 caractères maximum).' }

  const supabase = createServerSupabase()

  // Ne recréé pas si profil déjà existant
  const { data: existing } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) redirect('/organisateur')

  const { error } = await supabase.from('organizers').insert({
    user_id: user.id,
    display_name: displayName,
    bio: bio || null,
    organizer_type: organizerType,
    city,
    commission_rate: 0.15,
    is_approved: false,
  })

  if (error) return { error: 'Erreur lors de la création du profil.' }

  redirect('/organisateur')
}
