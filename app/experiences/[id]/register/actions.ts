'use server'

import { cookies } from 'next/headers'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { getCurrentTierInfo } from '@/lib/pricing'
import type { Experience } from '@/types/experience'
import type { ProfileId } from '@/constants/profiles'

type RegisterInput = {
  experienceId: string
  firstName: string
  lastName: string
  email: string
}

type RegisterResult =
  | { url: string }
  | { error: string }

export async function createCheckoutSession(input: RegisterInput): Promise<RegisterResult> {
  const { experienceId, firstName, lastName, email } = input

  // ── Validation ───────────────────────────────────────────────────────────
  if (!firstName.trim() || firstName.trim().length < 2) return { error: 'Prénom invalide.' }
  if (!lastName.trim() || lastName.trim().length < 2) return { error: 'Nom invalide.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email invalide.' }

  const supabase = createServerSupabase()

  // ── Recharge l'expérience côté serveur (jamais confiance au client) ──────
  const { data: exp, error: expError } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', experienceId)
    .eq('status', 'published')
    .single()

  if (expError || !exp) return { error: 'Expérience introuvable.' }

  const experience = exp as Experience

  // ── Calcul du palier — côté serveur ──────────────────────────────────────
  const tierInfo = getCurrentTierInfo(experience)
  if (tierInfo.isSoldOut) return { error: 'Cette expérience est complète.' }

  const { tier } = tierInfo

  // ── Profil utilisateur (cookie) + user_id si connecté ────────────────────
  const cookieStore = await cookies()
  const profileId = (cookieStore.get('sv_profile')?.value ?? 'inconnu') as ProfileId

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  // ── Création Registration pending ────────────────────────────────────────
  const { data: registration, error: regError } = await supabase
    .from('registrations')
    .insert({
      experience_id: experienceId,
      participant_first_name: firstName.trim(),
      participant_last_name: lastName.trim(),
      participant_email: email.toLowerCase().trim(),
      participant_profile_id: profileId,
      tier_id: tier.id,
      charter_accepted_at: new Date().toISOString(),
      payment_status: 'pending',
      amount_paid_cents: tier.price_cents,
      ...(user ? { user_id: user.id } : {}),
    })
    .select('id')
    .single()

  if (regError || !registration) return { error: 'Erreur lors de la création de la réservation.' }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'

  // ── Création session Stripe (prix calculé serveur) ───────────────────────
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: tier.price_cents,
          product_data: {
            name: experience.title,
            description: `${tier.label} · ${experience.venue_name}`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: email.toLowerCase().trim(),
    metadata: {
      registration_id: registration.id,
      experience_id: experienceId,
      tier_id: tier.id,
    },
    success_url: `${baseUrl}/experiences/${experienceId}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/experiences/${experienceId}/register`,
  })

  // ── Stocke stripe_session_id sur la Registration ─────────────────────────
  await supabase
    .from('registrations')
    .update({ stripe_session_id: session.id })
    .eq('id', registration.id)

  return { url: session.url! }
}
