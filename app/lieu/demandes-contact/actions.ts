'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

async function getClaimedLieuId(): Promise<string | null> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return null

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('lieux')
    .select('id')
    .eq('claimed_by_user_id', user.id)
    .single()

  return data?.id ?? null
}

export async function markRead(formData: FormData) {
  const requestId = formData.get('requestId') as string
  const lieuId = await getClaimedLieuId()
  if (!lieuId) redirect('/connexion')

  const supabase = createServerSupabase()
  await supabase
    .from('contact_requests')
    .update({ is_read: true })
    .eq('id', requestId)
    .eq('target_id', lieuId)

  revalidatePath('/lieu/demandes-contact')
}

export async function archiveRequest(formData: FormData) {
  const requestId = formData.get('requestId') as string
  const lieuId = await getClaimedLieuId()
  if (!lieuId) redirect('/connexion')

  const supabase = createServerSupabase()
  await supabase
    .from('contact_requests')
    .update({ is_read: true, is_archived: true })
    .eq('id', requestId)
    .eq('target_id', lieuId)

  revalidatePath('/lieu/demandes-contact')
}
