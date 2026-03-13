import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://arqtbjajbyglszuhjqbf.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycXRiamFqYnlnbHN6dWhqcWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjcwMDgsImV4cCI6MjA4ODg0MzAwOH0.vVqw6rmy-XdwilknRWJDy3LH4S6RlDjSly6c1XsA4Mg'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
