'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

const OWNER_EMAIL = 'misterzehar@gmail.com'

export async function createExperience(
  formData: FormData,
): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/nouvelle-soiree')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name, bio')
    .eq('user_id', user.id)
    .single()

  if (!organizer) redirect('/organisateur/inscription')

  // Infos générales
  const title = formData.get('title')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const venueName = formData.get('venueName')?.toString().trim() ?? ''
  const venueAmbiance = formData.get('venueAmbiance')?.toString().trim() ?? ''
  const date = formData.get('date')?.toString() ?? ''
  const durationMinutes = parseInt(formData.get('durationMinutes')?.toString() ?? '120', 10)

  // Menu social
  const entreeLabel = formData.get('entreeLabel')?.toString().trim() ?? ''
  const entreeDesc = formData.get('entreeDesc')?.toString().trim() ?? ''
  const entreeDuration = parseInt(formData.get('entreeDuration')?.toString() ?? '30', 10)
  const platLabel = formData.get('platLabel')?.toString().trim() ?? ''
  const platDesc = formData.get('platDesc')?.toString().trim() ?? ''
  const platDuration = parseInt(formData.get('platDuration')?.toString() ?? '60', 10)
  const dessertLabel = formData.get('dessertLabel')?.toString().trim() ?? ''
  const dessertDesc = formData.get('dessertDesc')?.toString().trim() ?? ''
  const dessertDuration = parseInt(formData.get('dessertDuration')?.toString() ?? '30', 10)

  // Paliers tarifaires
  const earlyQty = parseInt(formData.get('earlyQty')?.toString() ?? '0', 10) || 0
  const earlyPriceCents = Math.round(
    parseFloat(formData.get('earlyPrice')?.toString() ?? '0') * 100,
  )
  const standardQty = parseInt(formData.get('standardQty')?.toString() ?? '0', 10) || 0
  const standardPriceCents = Math.round(
    parseFloat(formData.get('standardPrice')?.toString() ?? '0') * 100,
  )
  const lastQty = parseInt(formData.get('lastQty')?.toString() ?? '0', 10) || 0
  const lastPriceCents = Math.round(
    parseFloat(formData.get('lastPrice')?.toString() ?? '0') * 100,
  )

  const compatibleProfiles = formData.getAll('compatibleProfiles').map(v => v.toString())

  // Validations
  if (title.length < 3) return { error: 'Titre trop court (3 caractères minimum).' }
  if (!venueName) return { error: 'Le nom du lieu est requis.' }
  if (!date) return { error: 'La date est requise.' }
  if (earlyQty + standardQty + lastQty < 1) return { error: 'Au moins 1 place est requise.' }
  if (compatibleProfiles.length === 0)
    return { error: 'Sélectionne au moins un profil compatible.' }
  if (!entreeLabel || !platLabel || !dessertLabel)
    return { error: 'Remplis les titres des 3 actes du menu social.' }

  const pricingTiers = []
  if (earlyQty > 0)
    pricingTiers.push({ id: 'early', label: 'Early bird', quantity: earlyQty, price_cents: earlyPriceCents })
  if (standardQty > 0)
    pricingTiers.push({ id: 'standard', label: 'Standard', quantity: standardQty, price_cents: standardPriceCents })
  if (lastQty > 0)
    pricingTiers.push({ id: 'last', label: 'Last chance', quantity: lastQty, price_cents: lastPriceCents })

  const menuSocial = {
    entree: {
      phase: 'Comprendre',
      label: entreeLabel,
      description: entreeDesc,
      duration_minutes: entreeDuration,
    },
    plat: {
      phase: 'Vivre',
      label: platLabel,
      description: platDesc,
      duration_minutes: platDuration,
    },
    dessert: {
      phase: 'Oser',
      label: dessertLabel,
      description: dessertDesc,
      duration_minutes: dessertDuration,
    },
  }

  // Auto-publish pour le propriétaire, draft pour les tiers
  const status = user.email === OWNER_EMAIL ? 'published' : 'draft'

  const { data: newExp, error } = await supabase
    .from('experiences')
    .insert({
      title,
      description,
      menu_social: menuSocial,
      venue_name: venueName,
      venue_ambiance: venueAmbiance || 'À confirmer',
      date,
      duration_minutes: isNaN(durationMinutes) ? 120 : durationMinutes,
      pricing_tiers: pricingTiers,
      capacity_max: earlyQty + standardQty + lastQty,
      capacity_current: 0,
      compatible_profiles: compatibleProfiles,
      organizer_name: organizer.display_name,
      organizer_bio: organizer.bio,
      organizer_id: organizer.id,
      status,
    })
    .select('id')
    .single()

  if (error || !newExp) return { error: 'Erreur lors de la création de la soirée.' }

  redirect(`/organisateur/soirees/${newExp.id}`)
}
