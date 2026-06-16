'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from '../_lib/auth'

const NOTES_ID = '00000000-0000-0000-0000-000000000001'

export async function saveAdminNotes(formData: FormData) {
  const adminToken = (formData.get('adminToken') as string) || undefined
  const content    = (formData.get('content') as string) ?? ''

  const ok = await checkAdminAccess(adminToken)
  if (!ok) return

  const supabase = createServerSupabase()
  await supabase.from('admin_notes').upsert({
    id:         NOTES_ID,
    content,
    updated_at: new Date().toISOString(),
  })

  revalidatePath('/admin')
}
