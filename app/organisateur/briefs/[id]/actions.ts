'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { sendOfferSelectedEmail, sendOfferRejectedEmail } from '@/lib/email'

async function getVerifiedOrganizer(supabase: ReturnType<typeof createServerSupabase>, userId: string) {
  const { data } = await supabase
    .from('organizers')
    .select('id, display_name')
    .eq('user_id', userId)
    .single()
  return data
}

export async function shortlistOffer(offerId: string, briefId: string): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const supabase = createServerSupabase()
  const organizer = await getVerifiedOrganizer(supabase, user.id)
  if (!organizer) return { error: 'Profil organisateur introuvable.' }

  const { data: brief } = await supabase
    .from('briefs')
    .select('organizer_id')
    .eq('id', briefId)
    .single()
  if (!brief || brief.organizer_id !== organizer.id) return { error: 'Accès refusé.' }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'shortlisted' })
    .eq('id', offerId)
    .eq('brief_id', briefId)
    .eq('status', 'submitted')

  if (error) return { error: 'Impossible de présélectionner cette offre.' }
  revalidatePath(`/organisateur/briefs/${briefId}`)
}

export async function selectOffer(offerId: string, briefId: string): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const supabase = createServerSupabase()
  const organizer = await getVerifiedOrganizer(supabase, user.id)
  if (!organizer) return { error: 'Profil organisateur introuvable.' }

  const { data: brief } = await supabase
    .from('briefs')
    .select('organizer_id, title, target_type')
    .eq('id', briefId)
    .single()
  if (!brief || brief.organizer_id !== organizer.id) return { error: 'Accès refusé.' }

  const { data: selectedOffer } = await supabase
    .from('offers')
    .select('id, responder_id, responder_type, responder_name, amount_cents, platform_fee_cents')
    .eq('id', offerId)
    .single()
  if (!selectedOffer) return { error: 'Offre introuvable.' }

  // 1. Sélectionner l'offre retenue
  await supabase.from('offers').update({ status: 'selected' }).eq('id', offerId)

  // 2. Rejeter toutes les autres offres de ce brief
  const { data: otherOffers } = await supabase
    .from('offers')
    .select('id, responder_id, responder_name')
    .eq('brief_id', briefId)
    .neq('id', offerId)
    .in('status', ['submitted', 'shortlisted'])

  if (otherOffers && otherOffers.length > 0) {
    await supabase
      .from('offers')
      .update({ status: 'rejected' })
      .eq('brief_id', briefId)
      .neq('id', offerId)
  }

  // 3. Fermer le brief
  await supabase.from('briefs').update({ status: 'selected' }).eq('id', briefId)

  // 4. Notif email — retenu
  const { data: { user: selectedUser } } = await supabase.auth.admin.getUserById(selectedOffer.responder_id)
  if (selectedUser?.email) {
    sendOfferSelectedEmail({
      to: selectedUser.email,
      firstName: selectedOffer.responder_name,
      briefTitle: brief.title,
      amountCents: selectedOffer.amount_cents,
      platformFeeCents: selectedOffer.platform_fee_cents,
      briefId,
      actorType: selectedOffer.responder_type as 'lieu' | 'fournisseur',
    }).catch(() => undefined)
  }

  // 5. Notif email — non-retenus
  for (const other of otherOffers ?? []) {
    const { data: { user: otherUser } } = await supabase.auth.admin.getUserById(other.responder_id)
    if (otherUser?.email) {
      sendOfferRejectedEmail({
        to: otherUser.email,
        firstName: other.responder_name,
        briefTitle: brief.title,
      }).catch(() => undefined)
    }
  }

  revalidatePath(`/organisateur/briefs/${briefId}`)
}

export async function closeBrief(briefId: string): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const supabase = createServerSupabase()
  const organizer = await getVerifiedOrganizer(supabase, user.id)
  if (!organizer) return { error: 'Profil organisateur introuvable.' }

  const { data: brief } = await supabase
    .from('briefs')
    .select('organizer_id')
    .eq('id', briefId)
    .single()
  if (!brief || brief.organizer_id !== organizer.id) return { error: 'Accès refusé.' }

  await supabase.from('briefs').update({ status: 'closed' }).eq('id', briefId)

  redirect('/organisateur/briefs')
}
