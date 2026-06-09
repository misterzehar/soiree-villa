'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import type { FournisseurCategory } from '@/types/fournisseur'

const VALID_CATEGORIES: FournisseurCategory[] = ['traiteur', 'dj_musique', 'deco', 'animation']

export async function updateFournisseurProfile(fournisseurId: string, formData: FormData): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const supabase = createServerSupabase()

  // Ownership check
  const { data: fournisseur } = await supabase
    .from('fournisseurs')
    .select('id')
    .eq('id', fournisseurId)
    .eq('claimed_by_user_id', user.id)
    .single()
  if (!fournisseur) return { error: 'Fournisseur introuvable ou accès refusé.' }

  const category = formData.get('category')?.toString() as FournisseurCategory
  if (!VALID_CATEGORIES.includes(category)) return { error: 'Catégorie invalide.' }

  const axes_scores = {
    energy:    parseInt(formData.get('axisEnergy')?.toString()   ?? '0'),
    structure: parseInt(formData.get('axisStructure')?.toString() ?? '0'),
    depth:     parseInt(formData.get('axisDepth')?.toString()    ?? '0'),
    sociality: parseInt(formData.get('axisSociality')?.toString() ?? '0'),
  }

  const { error: dbError } = await supabase
    .from('fournisseurs')
    .update({
      category,
      city:        formData.get('city')?.toString().trim() || 'Nice',
      description: formData.get('description')?.toString().trim() || null,
      photo_url:   formData.get('photo_url')?.toString().trim() || null,
      price_range: formData.get('price_range')?.toString().trim() || null,
      website_url: formData.get('website_url')?.toString().trim() || null,
      axes_scores,
    })
    .eq('id', fournisseurId)

  if (dbError) return { error: dbError.message }

  revalidatePath('/fournisseur')
  revalidatePath('/fournisseur/edit')
}
