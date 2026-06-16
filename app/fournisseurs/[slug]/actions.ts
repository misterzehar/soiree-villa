'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { sendContactRequestEmail, sendNewReviewNotification } from '@/lib/email'

export async function submitReview(formData: FormData) {
  const fournisseurId = formData.get('fournisseurId') as string
  const rating        = parseInt(formData.get('rating') as string, 10)
  const comment       = (formData.get('comment') as string).trim() || null
  const slug          = formData.get('slug') as string

  if (!fournisseurId || !rating || rating < 1 || rating > 5) return

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return

  const authorName = user.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
    : (user.email?.split('@')[0] ?? 'Anonyme')

  const supabase = createServerSupabase()

  const { data: f } = await supabase.from('fournisseurs').select('name').eq('id', fournisseurId).single()

  await supabase.from('reviews').insert({
    target_type: 'fournisseur',
    target_id: fournisseurId,
    author_id: user.id,
    author_name: authorName,
    rating,
    comment,
    is_published: false,
  })

  try {
    await sendNewReviewNotification({
      authorName,
      targetName: f?.name ?? fournisseurId,
      targetType: 'fournisseur',
      rating,
      comment,
    })
  } catch {}

  revalidatePath(`/fournisseurs/${slug}`)
}

export async function submitContactRequest(formData: FormData) {
  const fournisseurId = formData.get('fournisseurId') as string
  const senderName    = (formData.get('senderName') as string).trim()
  const senderEmail   = (formData.get('senderEmail') as string).trim()
  const message       = (formData.get('message') as string).trim()
  const slug          = formData.get('slug') as string

  if (!fournisseurId || !senderName || !senderEmail || !message) return

  const supabase = createServerSupabase()

  const { data: f } = await supabase
    .from('fournisseurs')
    .select('id, name, claimed_by_user_id')
    .eq('id', fournisseurId)
    .single()

  if (!f) return

  await supabase.from('contact_requests').insert({
    target_type: 'fournisseur',
    target_id: fournisseurId,
    sender_name: senderName,
    sender_email: senderEmail,
    message,
  })

  let recipientEmail = 'misterzehar@gmail.com'
  let recipientName  = 'Équipe Soirée Villa'

  if (f.claimed_by_user_id) {
    const { data: userData } = await supabase.auth.admin.getUserById(f.claimed_by_user_id)
    if (userData?.user?.email) {
      recipientEmail = userData.user.email
      recipientName  = userData.user.user_metadata?.first_name ?? f.name
    }
  }

  try {
    await sendContactRequestEmail({
      to: recipientEmail,
      recipientName,
      senderName,
      senderEmail,
      message,
      targetName: f.name,
      targetType: 'fournisseur',
    })
  } catch {}

  revalidatePath(`/fournisseurs/${slug}`)
}
