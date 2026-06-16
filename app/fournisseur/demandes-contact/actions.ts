'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

async function getClaimedFournisseurId(): Promise<string | null> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return null

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('fournisseurs')
    .select('id')
    .eq('claimed_by_user_id', user.id)
    .single()

  return data?.id ?? null
}

export async function markRead(formData: FormData) {
  const requestId = formData.get('requestId') as string
  const fournisseurId = await getClaimedFournisseurId()
  if (!fournisseurId) redirect('/connexion')

  const supabase = createServerSupabase()
  await supabase
    .from('contact_requests')
    .update({ is_read: true })
    .eq('id', requestId)
    .eq('target_id', fournisseurId)

  revalidatePath('/fournisseur/demandes-contact')
}

export async function archiveRequest(formData: FormData) {
  const requestId = formData.get('requestId') as string
  const fournisseurId = await getClaimedFournisseurId()
  if (!fournisseurId) redirect('/connexion')

  const supabase = createServerSupabase()
  await supabase
    .from('contact_requests')
    .update({ is_read: true, is_archived: true })
    .eq('id', requestId)
    .eq('target_id', fournisseurId)

  revalidatePath('/fournisseur/demandes-contact')
}
