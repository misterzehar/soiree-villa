'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { sendNewOfferEmail } from '@/lib/email'

export async function submitLieuOffer(
  briefId: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const supabase = createServerSupabase()

  const { data: lieu } = await supabase
    .from('lieux')
    .select('id, name, city, is_approved')
    .eq('claimed_by_user_id', user.id)
    .single()

  if (!lieu || !lieu.is_approved) return { error: 'Votre lieu n\'est pas encore approuvé.' }

  const amountRaw = formData.get('amount')?.toString().trim()
  const message = formData.get('message')?.toString().trim() ?? ''
  const amountCents = amountRaw ? Math.round(parseFloat(amountRaw) * 100) : 0

  if (amountCents <= 0) return { error: 'Montant invalide.' }
  if (message.length < 10) return { error: 'Message trop court (10 caractères minimum).' }

  const platformFeeCents = Math.round(amountCents * 0.15)

  const { error } = await supabase
    .from('offers')
    .insert({
      brief_id: briefId,
      responder_id: user.id,
      responder_type: 'lieu',
      responder_name: lieu.name,
      amount_cents: amountCents,
      platform_fee_cents: platformFeeCents,
      message,
      status: 'submitted',
    })

  if (error) {
    if (error.code === '23505') return { error: 'Vous avez déjà soumis une offre pour cette demande.' }
    return { error: 'Impossible d\'envoyer l\'offre.' }
  }

  // Notif email à l'organisateur (fire-and-forget)
  notifyOrganizer(briefId, lieu.name, amountCents, supabase).catch(() => undefined)

  revalidatePath(`/lieu/demandes/${briefId}`)
}

export async function updateLieuOffer(
  offerId: string,
  briefId: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const amountRaw = formData.get('amount')?.toString().trim()
  const message = formData.get('message')?.toString().trim() ?? ''
  const amountCents = amountRaw ? Math.round(parseFloat(amountRaw) * 100) : 0

  if (amountCents <= 0) return { error: 'Montant invalide.' }
  if (message.length < 10) return { error: 'Message trop court.' }

  const platformFeeCents = Math.round(amountCents * 0.15)
  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('offers')
    .update({ amount_cents: amountCents, platform_fee_cents: platformFeeCents, message })
    .eq('id', offerId)
    .eq('responder_id', user.id)
    .eq('status', 'submitted')

  if (error) return { error: 'Impossible de modifier l\'offre.' }
  revalidatePath(`/lieu/demandes/${briefId}`)
}

async function notifyOrganizer(
  briefId: string,
  responderName: string,
  amountCents: number,
  supabase: ReturnType<typeof createServerSupabase>,
) {
  const { data: brief } = await supabase
    .from('briefs')
    .select('title, organizer_id, organizers(user_id, display_name)')
    .eq('id', briefId)
    .single()

  if (!brief) return
  const org = Array.isArray(brief.organizers) ? brief.organizers[0] : brief.organizers
  if (!org) return

  const { data: { user: orgUser } } = await supabase.auth.admin.getUserById(org.user_id)
  if (!orgUser?.email) return

  await sendNewOfferEmail({
    to: orgUser.email,
    organizerFirstName: org.display_name,
    responderName,
    briefTitle: brief.title,
    amountCents,
    briefId,
  })
}
