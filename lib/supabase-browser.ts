import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

/**
 * Browser-side Supabase client for the VTM tool's sign-in flow. Unlike the
 * shared server client (lib/supabase.ts), this one persists the session in
 * localStorage and refreshes tokens, so a signed-in user stays signed in.
 * Returns null when Supabase is not configured — the tool then runs in open
 * mode with no auth UI.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  }
  return client
}
