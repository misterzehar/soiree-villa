'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

export async function toggleCheckIn(
  registrationId: string,
  currentState: boolean,
  experienceId: string,
): Promise<{ error: string } | { success: true }> {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const supabase = createServerSupabase()

  // Vérifie que cette expérience appartient bien à cet organisateur
  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!organizer) return { error: 'Profil organisateur introuvable.' }

  const { data: exp } = await supabase
    .from('experiences')
    .select('id')
    .eq('id', experienceId)
    .eq('organizer_id', organizer.id)
    .single()

  if (!exp) return { error: 'Non autorisé.' }

  await supabase
    .from('registrations')
    .update({
      checked_in: !currentState,
      checked_in_at: !currentState ? new Date().toISOString() : null,
    })
    .eq('id', registrationId)

  revalidatePath(`/organisateur/soirees/${experienceId}`)
  return { success: true }
}
