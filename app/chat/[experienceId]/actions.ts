'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createServerSupabase } from '@/lib/supabase'
import { sendOrganizerMessageEmail } from '@/lib/email'

export async function sendMessage(
  conversationId: string,
  experienceId: string,
  content: string,
  photoUrl?: string,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const trimmed = content.trim()
  if (!trimmed && !photoUrl) return { error: 'Le message est vide.' }
  if (trimmed.length > 2000) return { error: 'Message trop long (max 2000 caractères).' }

  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed || null,
      photo_url: photoUrl ?? null,
    })

  if (error) return { error: 'Impossible d\'envoyer le message.' }

  // Si l'expéditeur est l'organisateur → email aux participants
  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()

  if (organizer && trimmed) {
    const [{ data: experience }, { data: registrations }] = await Promise.all([
      supabase.from('experiences').select('title, date, venue_name').eq('id', experienceId).single(),
      supabase.from('registrations')
        .select('participant_email, participant_first_name')
        .eq('experience_id', experienceId)
        .eq('payment_status', 'paid'),
    ])

    if (experience && registrations) {
      for (const reg of registrations) {
        if (reg.participant_email === user.email) continue
        sendOrganizerMessageEmail({
          to: reg.participant_email,
          firstName: reg.participant_first_name,
          organizerName: organizer.display_name,
          experienceTitle: experience.title,
          experienceId,
          messagePreview: trimmed.slice(0, 200),
        }).catch(() => undefined)
      }
    }
  }

  revalidatePath(`/chat/${experienceId}`)
}

export async function deleteMessage(
  messageId: string,
  experienceId: string,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!organizer) return { error: 'Seul l\'organisateur peut supprimer des messages.' }

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)

  if (error) return { error: 'Impossible de supprimer le message.' }
  revalidatePath(`/chat/${experienceId}`)
}

export async function reportParticipant(
  reportedUserId: string,
  conversationId: string,
  reason: string,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  if (!reason.trim()) return { error: 'Veuillez indiquer une raison.' }

  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      conversation_id: conversationId,
      reason: reason.trim(),
    })

  if (error) return { error: 'Impossible de signaler cet utilisateur.' }
}

export async function markRead(conversationId: string): Promise<void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return

  const supabase = createServerSupabase()
  await supabase
    .from('message_reads')
    .upsert(
      { user_id: user.id, conversation_id: conversationId, last_read_at: new Date().toISOString() },
      { onConflict: 'user_id,conversation_id' },
    )
}
