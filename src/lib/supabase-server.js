import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createMockClient, createMockServiceClient } from './supabase-mock'

export function createClient() {
  const cookieStore = cookies()

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL or Anon Key is missing or empty.');
    }
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )
  } catch (err) {
    console.warn('⚠️ Server-side Supabase client could not be initialized. Using mock client.');
    return createMockClient();
  }
}

export function createServiceClient() {
  const cookieStore = cookies()
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase URL or Service Role Key is missing or empty.');
    }
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )
  } catch (err) {
    console.warn('⚠️ Server-side Supabase Service client could not be initialized. Using mock service client.');
    return createMockServiceClient();
  }
}
