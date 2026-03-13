import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase env vars missing:", {
      url: supabaseUrl ? "set" : "missing",
      key: supabaseAnonKey ? "set" : "missing"
    })
    throw new Error("Supabase environment variables are not configured")
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
