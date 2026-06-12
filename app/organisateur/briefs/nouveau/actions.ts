'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { sendBriefOpenEmail } from '@/lib/email'
import type { FournisseurCategory } from '@/types/fournisseur'

const VALID_CATEGORIES: FournisseurCategory[] = ['traiteur', 'dj_musique', 'deco', 'animation']

export async function createBrief(formData: FormData): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur/briefs/nouveau')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name, user_id')
    .eq('user_id', user.id)
    .single()

  if (!organizer) redirect('/organisateur/inscription')

  const targetType = formData.get('target_type')?.toString()
  const targetCategory = formData.get('target_category')?.toString() || null
  const city = formData.get('city')?.toString().trim() ?? ''
  const eventDate = formData.get('event_date')?.toString() ?? ''
  const title = formData.get('title')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const budgetRaw = formData.get('budget_estimate')?.toString().trim()
  const budgetCents = budgetRaw ? Math.round(parseFloat(budgetRaw) * 100) : null

  if (targetType !== 'lieu' && targetType !== 'fournisseur')
    return { error: 'Type de brief invalide.' }
  if (targetType === 'fournisseur' && (!targetCategory || !VALID_CATEGORIES.includes(targetCategory as FournisseurCategory)))
    return { error: 'Catégorie de prestataire requise.' }
  if (!city) return { error: 'La ville est requise.' }
  if (!eventDate) return { error: 'La date de l\'événement est requise.' }
  if (title.length < 5) return { error: 'Titre trop court (5 caractères minimum).' }
  if (description.length < 20) return { error: 'Description trop courte (20 caractères minimum).' }

  // expires_at = event_date - 7 days
  const expiresAt = new Date(new Date(eventDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: brief, error } = await supabase
    .from('briefs')
    .insert({
      organizer_id: organizer.id,
      target_type: targetType,
      target_category: targetType === 'lieu' ? null : targetCategory,
      city,
      event_date: eventDate,
      expires_at: expiresAt,
      title,
      description,
      budget_estimate_cents: budgetCents,
      status: 'open',
    })
    .select('id')
    .single()

  if (error || !brief) return { error: 'Impossible de créer l\'appel d\'offres.' }

  // Broadcast email aux lieux/fournisseurs matchants (fire-and-forget)
  broadcastBriefEmail({
    briefId: brief.id,
    organizerName: organizer.display_name,
    title,
    description,
    city,
    eventDate,
    budgetCents,
    targetType: targetType as 'lieu' | 'fournisseur',
    targetCategory: targetCategory as FournisseurCategory | null,
    supabase,
  }).catch(() => undefined)

  redirect(`/organisateur/briefs/${brief.id}`)
}

async function broadcastBriefEmail(opts: {
  briefId: string
  organizerName: string
  title: string
  description: string
  city: string
  eventDate: string
  budgetCents: number | null
  targetType: 'lieu' | 'fournisseur'
  targetCategory: FournisseurCategory | null
  supabase: ReturnType<typeof createServerSupabase>
}) {
  const { briefId, organizerName, title, description, city, eventDate, budgetCents, targetType, targetCategory, supabase } = opts

  const budgetLabel = budgetCents ? `${Math.round(budgetCents / 100)} €` : null

  let recipientUserIds: string[] = []
  let recipientNames: Record<string, string> = {}

  if (targetType === 'lieu') {
    const { data } = await supabase
      .from('lieux')
      .select('claimed_by_user_id, name')
      .eq('city', city)
      .eq('is_approved', true)
      .not('claimed_by_user_id', 'is', null)
    for (const r of data ?? []) {
      if (r.claimed_by_user_id) {
        recipientUserIds.push(r.claimed_by_user_id)
        recipientNames[r.claimed_by_user_id] = r.name
      }
    }
  } else {
    const { data } = await supabase
      .from('fournisseurs')
      .select('claimed_by_user_id, name')
      .eq('city', city)
      .eq('is_approved', true)
      .eq('category', targetCategory!)
      .not('claimed_by_user_id', 'is', null)
    for (const r of data ?? []) {
      if (r.claimed_by_user_id) {
        recipientUserIds.push(r.claimed_by_user_id)
        recipientNames[r.claimed_by_user_id] = r.name
      }
    }
  }

  for (const userId of recipientUserIds) {
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user?.email) continue
    sendBriefOpenEmail({
      to: user.email,
      firstName: recipientNames[userId] ?? 'Partenaire',
      organizerName,
      briefTitle: title,
      briefDescription: description,
      city,
      eventDate,
      budgetLabel,
      briefId,
      actorType: targetType,
    }).catch(() => undefined)
  }
}
