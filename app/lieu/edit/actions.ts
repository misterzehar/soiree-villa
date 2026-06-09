'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

export async function updateLieuProfile(lieuId: string, formData: FormData): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const supabase = createServerSupabase()

  // Ownership check
  const { data: lieu } = await supabase
    .from('lieux')
    .select('id')
    .eq('id', lieuId)
    .eq('claimed_by_user_id', user.id)
    .single()
  if (!lieu) return { error: 'Lieu introuvable ou accès refusé.' }

  const axes_scores = {
    energy:    parseInt(formData.get('axisEnergy')?.toString()   ?? '0'),
    structure: parseInt(formData.get('axisStructure')?.toString() ?? '0'),
    depth:     parseInt(formData.get('axisDepth')?.toString()    ?? '0'),
    sociality: parseInt(formData.get('axisSociality')?.toString() ?? '0'),
  }

  const { error: dbError } = await supabase
    .from('lieux')
    .update({
      address:     formData.get('address')?.toString().trim() || null,
      city:        formData.get('city')?.toString().trim() || 'Nice',
      capacity:    formData.get('capacity') ? parseInt(formData.get('capacity')!.toString()) : null,
      ambiance:    formData.get('ambiance')?.toString().trim() || null,
      lieu_type:   formData.get('lieu_type')?.toString() || 'salle',
      photo_url:   formData.get('photo_url')?.toString().trim() || null,
      website_url: formData.get('website_url')?.toString().trim() || null,
      axes_scores,
    })
    .eq('id', lieuId)

  if (dbError) return { error: dbError.message }

  revalidatePath('/lieu')
  revalidatePath('/lieu/edit')
}
