'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from '../_lib/auth'

export async function publishReview(formData: FormData) {
  const adminToken = formData.get('adminToken') as string | undefined
  const reviewId   = formData.get('reviewId') as string

  const isAdmin = await checkAdminAccess(adminToken || undefined)
  if (!isAdmin) redirect('/admin')

  const supabase = createServerSupabase()
  await supabase.from('reviews').update({ is_published: true }).eq('id', reviewId)
  revalidatePath('/admin/avis')
}

export async function rejectReview(formData: FormData) {
  const adminToken = formData.get('adminToken') as string | undefined
  const reviewId   = formData.get('reviewId') as string

  const isAdmin = await checkAdminAccess(adminToken || undefined)
  if (!isAdmin) redirect('/admin')

  const supabase = createServerSupabase()
  await supabase.from('reviews').delete().eq('id', reviewId)
  revalidatePath('/admin/avis')
}
