'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase'

export async function publishExperience(
  formData: FormData,
): Promise<{ error: string } | void> {
  const token = formData.get('adminToken')?.toString()
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return { error: 'Non autorisé.' }
  }

  const experienceId = formData.get('experienceId')?.toString()
  if (!experienceId) return { error: 'ID manquant.' }

  const supabase = createServerSupabase()
  await supabase
    .from('experiences')
    .update({ status: 'published' })
    .eq('id', experienceId)

  revalidatePath('/admin')
}
