import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Force the correct Supabase project (env vars point to wrong project)
const SUPABASE_URL = 'https://arqtbjajbyglszuhjqbf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycXRiamFqYnlnbHN6dWhqcWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjcwMDgsImV4cCI6MjA4ODg0MzAwOH0.vVqw6rmy-XdwilknRWJDy3LH4S6RlDjSly6c1XsA4Mg'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
