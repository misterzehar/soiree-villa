'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { generateUniqueSlug } from '@/lib/slug'
import type { FournisseurCategory } from '@/types/fournisseur'

const VALID_CATEGORIES: FournisseurCategory[] = ['traiteur', 'dj_musique', 'deco', 'animation']

export async function createFournisseurProfile(formData: FormData): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const supabase = createServerSupabase()

  // Vérifie qu'il n'a pas déjà un fournisseur
  const { data: existing } = await supabase
    .from('fournisseurs')
    .select('id')
    .eq('claimed_by_user_id', user.id)
    .single()
  if (existing) return { error: 'Vous avez déjà un profil fournisseur.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { error: 'Le nom est obligatoire.' }

  const category = formData.get('category')?.toString() as FournisseurCategory
  if (!VALID_CATEGORIES.includes(category)) return { error: 'Catégorie invalide.' }

  const slug = await generateUniqueSlug(name, async (s) => {
    const { data } = await supabase.from('fournisseurs').select('id').eq('slug', s).single()
    return !!data
  })

  const axes_scores = {
    energy:    parseInt(formData.get('axisEnergy')?.toString()   ?? '0'),
    structure: parseInt(formData.get('axisStructure')?.toString() ?? '0'),
    depth:     parseInt(formData.get('axisDepth')?.toString()    ?? '0'),
    sociality: parseInt(formData.get('axisSociality')?.toString() ?? '0'),
  }

  const { error: dbError } = await supabase.from('fournisseurs').insert({
    name,
    slug,
    category,
    city:               formData.get('city')?.toString().trim() || 'Nice',
    description:        formData.get('description')?.toString().trim() || null,
    photo_url:          formData.get('photo_url')?.toString().trim() || null,
    price_range:        formData.get('price_range')?.toString().trim() || null,
    website_url:        formData.get('website_url')?.toString().trim() || null,
    axes_scores,
    is_approved:        false,
    claimed_by_user_id: user.id,
  })

  if (dbError) return { error: dbError.message }

  redirect('/fournisseur')
}
