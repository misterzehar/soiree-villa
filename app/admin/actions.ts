'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase'

function verifyAdmin(token: string | null | undefined): void {
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    throw new Error('Non autorisé.')
  }
}

export async function publishExperience(formData: FormData): Promise<void> {
  verifyAdmin(formData.get('adminToken')?.toString())

  const experienceId = formData.get('experienceId')?.toString()
  if (!experienceId) throw new Error('ID expérience manquant.')

  const supabase = createServerSupabase()
  await supabase.from('experiences').update({ status: 'published' }).eq('id', experienceId)
  revalidatePath('/admin')
}

export async function approveLieu(formData: FormData): Promise<void> {
  verifyAdmin(formData.get('adminToken')?.toString())

  const lieuId = formData.get('lieuId')?.toString()
  if (!lieuId) throw new Error('ID lieu manquant.')

  const supabase = createServerSupabase()
  await supabase.from('lieux').update({ is_approved: true }).eq('id', lieuId)
  revalidatePath('/admin')
}

export async function rejectLieu(formData: FormData): Promise<void> {
  verifyAdmin(formData.get('adminToken')?.toString())

  const lieuId = formData.get('lieuId')?.toString()
  if (!lieuId) throw new Error('ID lieu manquant.')

  const supabase = createServerSupabase()
  await supabase.from('lieux').delete().eq('id', lieuId)
  revalidatePath('/admin')
}

export async function approveFournisseur(formData: FormData): Promise<void> {
  verifyAdmin(formData.get('adminToken')?.toString())

  const fournisseurId = formData.get('fournisseurId')?.toString()
  if (!fournisseurId) throw new Error('ID fournisseur manquant.')

  const supabase = createServerSupabase()
  await supabase.from('fournisseurs').update({ is_approved: true }).eq('id', fournisseurId)
  revalidatePath('/admin')
}

export async function rejectFournisseur(formData: FormData): Promise<void> {
  verifyAdmin(formData.get('adminToken')?.toString())

  const fournisseurId = formData.get('fournisseurId')?.toString()
  if (!fournisseurId) throw new Error('ID fournisseur manquant.')

  const supabase = createServerSupabase()
  await supabase.from('fournisseurs').delete().eq('id', fournisseurId)
  revalidatePath('/admin')
}
