import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ── Service-role client ───────────────────────────────────────────────────────
// Bypasse RLS. Server actions, webhooks, admin uniquement — jamais exposé client.
export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ── SSR client avec session (Server Components, Server Actions) ───────────────
// Respecte RLS. Lit et écrit la session dans les cookies Next.js.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // En lecture seule dans les Server Components — ignoré
        }
      },
    },
  })
}
