import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://phnkgxblcimnsutkwcjq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobmtneGJsY2ltbnN1dGt3Y2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDMwNzYsImV4cCI6MjA4ODkxOTA3Nn0.Y4gkhpAYiRCEc3Fs-Dz6-IeHGOZPUGoebk87l7o1u4Y'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
