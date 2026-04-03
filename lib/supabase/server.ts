import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Mock client for when Supabase isn't configured
const createMockClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => ({ data: [], error: null, order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    upsert: () => ({ data: null, error: null }),
  }),
} as any)

export async function createClient() {
  if (!isSupabaseConfigured) {
    return createMockClient()
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
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
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

export async function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return createMockClient()
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
