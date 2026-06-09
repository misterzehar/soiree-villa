'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

// ─── Helper : vérifie que l'expérience appartient à l'organisateur connecté ──

async function verifyOrganizerOwnership(experienceId: string) {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié.' as const, organizer: null, exp: null }

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!organizer) return { error: 'Profil organisateur introuvable.' as const, organizer: null, exp: null }

  const { data: exp } = await supabase
    .from('experiences')
    .select('id, status')
    .eq('id', experienceId)
    .eq('organizer_id', organizer.id)
    .single()

  if (!exp) return { error: 'Expérience introuvable ou non autorisée.' as const, organizer: null, exp: null }

  return { error: null, organizer, exp }
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export async function toggleCheckIn(
  registrationId: string,
  currentState: boolean,
  experienceId: string,
): Promise<{ error: string } | { success: true }> {
  const { error } = await verifyOrganizerOwnership(experienceId)
  if (error) return { error }

  const supabase = createServerSupabase()
  await supabase
    .from('registrations')
    .update({
      checked_in: !currentState,
      checked_in_at: !currentState ? new Date().toISOString() : null,
    })
    .eq('id', registrationId)

  revalidatePath(`/organisateur/soirees/${experienceId}`)
  return { success: true }
}

// ─── Mise à jour d'une soirée existante ───────────────────────────────────────

export async function updateExperience(
  experienceId: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const { error, organizer } = await verifyOrganizerOwnership(experienceId)
  if (error || !organizer) return { error: error ?? 'Non autorisé.' }

  const title = formData.get('title')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const venueName = formData.get('venueName')?.toString().trim() ?? ''
  const venueAmbiance = formData.get('venueAmbiance')?.toString().trim() ?? ''
  const date = formData.get('date')?.toString() ?? ''
  const durationMinutes = parseInt(formData.get('durationMinutes')?.toString() ?? '120', 10)

  const entreeLabel = formData.get('entreeLabel')?.toString().trim() ?? ''
  const entreeDesc  = formData.get('entreeDesc')?.toString().trim() ?? ''
  const entreeDuration = parseInt(formData.get('entreeDuration')?.toString() ?? '30', 10)
  const platLabel   = formData.get('platLabel')?.toString().trim() ?? ''
  const platDesc    = formData.get('platDesc')?.toString().trim() ?? ''
  const platDuration = parseInt(formData.get('platDuration')?.toString() ?? '60', 10)
  const dessertLabel = formData.get('dessertLabel')?.toString().trim() ?? ''
  const dessertDesc  = formData.get('dessertDesc')?.toString().trim() ?? ''
  const dessertDuration = parseInt(formData.get('dessertDuration')?.toString() ?? '30', 10)

  const earlyQty   = parseInt(formData.get('earlyQty')?.toString() ?? '0', 10) || 0
  const earlyPrice = Math.round(parseFloat(formData.get('earlyPrice')?.toString() ?? '0') * 100)
  const standardQty   = parseInt(formData.get('standardQty')?.toString() ?? '0', 10) || 0
  const standardPrice = Math.round(parseFloat(formData.get('standardPrice')?.toString() ?? '0') * 100)
  const lastQty   = parseInt(formData.get('lastQty')?.toString() ?? '0', 10) || 0
  const lastPrice = Math.round(parseFloat(formData.get('lastPrice')?.toString() ?? '0') * 100)

  const compatibleProfiles = formData.getAll('compatibleProfiles').map(v => v.toString())

  if (title.length < 3) return { error: 'Titre trop court (3 caractères minimum).' }
  if (!venueName) return { error: 'Le nom du lieu est requis.' }
  if (!date) return { error: 'La date est requise.' }
  if (earlyQty + standardQty + lastQty < 1) return { error: 'Au moins 1 place est requise.' }
  if (compatibleProfiles.length === 0) return { error: 'Sélectionne au moins un profil compatible.' }
  if (!entreeLabel || !platLabel || !dessertLabel) return { error: 'Remplis les titres des 3 actes du menu social.' }

  const pricingTiers = []
  if (earlyQty > 0) pricingTiers.push({ id: 'early', label: 'Early bird', quantity: earlyQty, price_cents: earlyPrice })
  if (standardQty > 0) pricingTiers.push({ id: 'standard', label: 'Standard', quantity: standardQty, price_cents: standardPrice })
  if (lastQty > 0) pricingTiers.push({ id: 'last', label: 'Last chance', quantity: lastQty, price_cents: lastPrice })

  const menuSocial = {
    entree:  { phase: 'Comprendre', label: entreeLabel,  description: entreeDesc,  duration_minutes: entreeDuration },
    plat:    { phase: 'Vivre',      label: platLabel,    description: platDesc,    duration_minutes: platDuration },
    dessert: { phase: 'Oser',       label: dessertLabel, description: dessertDesc, duration_minutes: dessertDuration },
  }

  const supabase = createServerSupabase()
  const { error: dbError } = await supabase
    .from('experiences')
    .update({
      title, description,
      menu_social: menuSocial,
      venue_name: venueName,
      venue_ambiance: venueAmbiance || 'À confirmer',
      date,
      duration_minutes: isNaN(durationMinutes) ? 120 : durationMinutes,
      pricing_tiers: pricingTiers,
      capacity_max: earlyQty + standardQty + lastQty,
      compatible_profiles: compatibleProfiles,
    })
    .eq('id', experienceId)

  if (dbError) return { error: 'Erreur lors de la mise à jour.' }

  revalidatePath(`/organisateur/soirees/${experienceId}`)
  redirect(`/organisateur/soirees/${experienceId}?updated=1`)
}

// ─── Dépublication (published → draft) ────────────────────────────────────────

export async function depublishExperience(experienceId: string): Promise<void> {
  const { error } = await verifyOrganizerOwnership(experienceId)
  if (error) return

  const supabase = createServerSupabase()
  await supabase
    .from('experiences')
    .update({ status: 'draft' })
    .eq('id', experienceId)

  revalidatePath(`/organisateur/soirees/${experienceId}`)
  revalidatePath('/organisateur')
}

// ─── Suppression (seulement si aucune inscription payée) ──────────────────────

export async function deleteExperience(experienceId: string): Promise<void> {
  const { error } = await verifyOrganizerOwnership(experienceId)
  if (error) return

  const supabase = createServerSupabase()

  // Refuse si des inscriptions payées existent
  const { count } = await supabase
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('experience_id', experienceId)
    .eq('payment_status', 'paid')

  if ((count ?? 0) > 0) return

  await supabase.from('experiences').delete().eq('id', experienceId)

  revalidatePath('/organisateur')
  redirect('/organisateur')
}
