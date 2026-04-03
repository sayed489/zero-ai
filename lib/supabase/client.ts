import { createBrowserClient } from '@supabase/ssr'

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Flag to check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Only warn once
let hasWarnedAboutMissingConfig = false

// Create a mock client that doesn't throw errors when Supabase isn't configured
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ data: [], error: null, order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    upsert: () => ({ data: null, error: null }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
  }),
  removeChannel: () => {},
} as any

export function createClient() {
  if (!isSupabaseConfigured) {
    if (!hasWarnedAboutMissingConfig) {
      hasWarnedAboutMissingConfig = true
      console.info('[Zero AI] Running in offline mode - add Supabase credentials for cloud features')
    }
    return mockClient
  }
  
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}
