import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client serveur — utilisé uniquement dans les Server Actions et Route Handlers
export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}
