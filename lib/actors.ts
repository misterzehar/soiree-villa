import { createServerSupabase } from './supabase'

export type ActorProfiles = {
  hasOrga: boolean
  hasLieu: boolean
  hasFourn: boolean
}

export async function getActorProfiles(userId: string): Promise<ActorProfiles> {
  const supabase = createServerSupabase()
  const [{ data: orga }, { data: lieu }, { data: fourn }] = await Promise.all([
    supabase.from('organizers').select('id').eq('user_id', userId).single(),
    supabase.from('lieux').select('id').eq('claimed_by_user_id', userId).single(),
    supabase.from('fournisseurs').select('id').eq('claimed_by_user_id', userId).single(),
  ])
  return { hasOrga: !!orga, hasLieu: !!lieu, hasFourn: !!fourn }
}
