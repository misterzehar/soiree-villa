import { createSupabaseServerClient } from '@/lib/supabase'

export const ADMIN_EMAIL = 'misterzehar@gmail.com'

export async function checkAdminAccess(token?: string): Promise<boolean> {
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) return true
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === ADMIN_EMAIL
  } catch {
    return false
  }
}
