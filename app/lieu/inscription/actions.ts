'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { generateUniqueSlug } from '@/lib/slug'

export async function createLieuProfile(formData: FormData): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const supabase = createServerSupabase()

  // Vérifie qu'il n'a pas déjà un lieu
  const { data: existing } = await supabase
    .from('lieux')
    .select('id')
    .eq('claimed_by_user_id', user.id)
    .single()
  if (existing) return { error: 'Vous avez déjà un profil lieu.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { error: 'Le nom est obligatoire.' }

  const slug = await generateUniqueSlug(name, async (s) => {
    const { data } = await supabase.from('lieux').select('id').eq('slug', s).single()
    return !!data
  })

  const axes_scores = {
    energy:    parseInt(formData.get('axisEnergy')?.toString()   ?? '0'),
    structure: parseInt(formData.get('axisStructure')?.toString() ?? '0'),
    depth:     parseInt(formData.get('axisDepth')?.toString()    ?? '0'),
    sociality: parseInt(formData.get('axisSociality')?.toString() ?? '0'),
  }

  const { error: dbError } = await supabase.from('lieux').insert({
    name,
    slug,
    address:              formData.get('address')?.toString().trim() || null,
    city:                 formData.get('city')?.toString().trim() || 'Nice',
    capacity:             formData.get('capacity') ? parseInt(formData.get('capacity')!.toString()) : null,
    ambiance:             formData.get('ambiance')?.toString().trim() || null,
    lieu_type:            formData.get('lieu_type')?.toString() || 'salle',
    photo_url:            formData.get('photo_url')?.toString().trim() || null,
    website_url:          formData.get('website_url')?.toString().trim() || null,
    axes_scores,
    is_approved:          false,
    claimed_by_user_id:   user.id,
    charter_accepted_at:  new Date().toISOString(),
  })

  if (dbError) return { error: dbError.message }

  redirect('/lieu')
}
