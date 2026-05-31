import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from './supabase-mock'

export function createClient() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL or Anon Key is missing or empty.');
    }
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  } catch (err) {
    console.warn('⚠️ Client-side Supabase client could not be initialized. Using mock client.');
    return createMockClient()
  }
}

