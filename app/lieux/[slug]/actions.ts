'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { sendContactRequestEmail, sendNewReviewNotification } from '@/lib/email'

export async function submitReview(formData: FormData) {
  const lieuId   = formData.get('lieuId') as string
  const rating   = parseInt(formData.get('rating') as string, 10)
  const comment  = (formData.get('comment') as string).trim() || null
  const slug     = formData.get('slug') as string

  if (!lieuId || !rating || rating < 1 || rating > 5) return

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return

  const authorName = user.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
    : (user.email?.split('@')[0] ?? 'Anonyme')

  const supabase = createServerSupabase()

  const { data: lieu } = await supabase.from('lieux').select('name').eq('id', lieuId).single()

  await supabase.from('reviews').insert({
    target_type: 'lieu',
    target_id: lieuId,
    author_id: user.id,
    author_name: authorName,
    rating,
    comment,
    is_published: false,
  })

  try {
    await sendNewReviewNotification({
      authorName,
      targetName: lieu?.name ?? lieuId,
      targetType: 'lieu',
      rating,
      comment,
    })
  } catch {}

  revalidatePath(`/lieux/${slug}`)
}

export async function submitContactRequest(formData: FormData) {
  const lieuId      = formData.get('lieuId') as string
  const senderName  = (formData.get('senderName') as string).trim()
  const senderEmail = (formData.get('senderEmail') as string).trim()
  const message     = (formData.get('message') as string).trim()
  const slug        = formData.get('slug') as string

  if (!lieuId || !senderName || !senderEmail || !message) return

  const supabase = createServerSupabase()

  const { data: lieu } = await supabase
    .from('lieux')
    .select('id, name, claimed_by_user_id')
    .eq('id', lieuId)
    .single()

  if (!lieu) return

  await supabase.from('contact_requests').insert({
    target_type: 'lieu',
    target_id: lieuId,
    sender_name: senderName,
    sender_email: senderEmail,
    message,
  })

  let recipientEmail = 'misterzehar@gmail.com'
  let recipientName  = 'Équipe Soirée Villa'

  if (lieu.claimed_by_user_id) {
    const { data: userData } = await supabase.auth.admin.getUserById(lieu.claimed_by_user_id)
    if (userData?.user?.email) {
      recipientEmail = userData.user.email
      recipientName  = userData.user.user_metadata?.first_name ?? lieu.name
    }
  }

  try {
    await sendContactRequestEmail({
      to: recipientEmail,
      recipientName,
      senderName,
      senderEmail,
      message,
      targetName: lieu.name,
      targetType: 'lieu',
    })
  } catch {}

  revalidatePath(`/lieux/${slug}`)
}
