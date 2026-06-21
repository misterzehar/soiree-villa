'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { type TierCategory, type ItemsByTier, emptyItemsByTier, moveItem, tierOfItem } from '@/lib/community-tier'
import type { TierLabel } from '@/lib/tier'

export async function saveTierList(
  category: TierCategory,
  itemsByTier: ItemsByTier,
): Promise<{ error?: string }> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const supabase = createServerSupabase()
  const { error } = await supabase
    .from('user_tier_lists')
    .upsert(
      {
        user_id: user.id,
        category,
        items_by_tier: itemsByTier,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,category' },
    )

  if (error) return { error: error.message }

  revalidatePath('/tier-list/mienne')
  revalidatePath(`/tier-list/communaute/${category}`)
  return {}
}

export async function moveTierItem(
  category: TierCategory,
  itemId: string,
  targetTier: TierLabel | null,
): Promise<{ error?: string }> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const supabase = createServerSupabase()

  // Load existing tier list
  const { data: existing } = await supabase
    .from('user_tier_lists')
    .select('items_by_tier')
    .eq('user_id', user.id)
    .eq('category', category)
    .single()

  const current = (existing?.items_by_tier as ItemsByTier | null) ?? emptyItemsByTier()
  const updated = moveItem(current, itemId, targetTier)

  const { error } = await supabase
    .from('user_tier_lists')
    .upsert(
      {
        user_id: user.id,
        category,
        items_by_tier: updated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,category' },
    )

  if (error) return { error: error.message }
  revalidatePath('/tier-list/mienne')
  return {}
}

export async function getUserTierList(
  userId: string,
  category: TierCategory,
): Promise<ItemsByTier> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('user_tier_lists')
    .select('items_by_tier')
    .eq('user_id', userId)
    .eq('category', category)
    .single()

  return (data?.items_by_tier as ItemsByTier | null) ?? emptyItemsByTier()
}
