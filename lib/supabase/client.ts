import { createBrowserClient } from '@supabase/ssr'

// Only warn once
let hasWarnedAboutMissingConfig = false

// Create a mock client that doesn't throw errors when Supabase isn't configured
const createMockClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ 
      data: [], 
      error: null, 
      order: () => ({ 
        data: [], 
        error: null, 
        limit: () => ({ data: [], error: null }) 
      }) 
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    upsert: () => ({ data: null, error: null }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
  }),
  removeChannel: () => {},
}) as ReturnType<typeof createBrowserClient>

// Check if Supabase is configured - as a function to avoid early evaluation
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!hasWarnedAboutMissingConfig && typeof window !== 'undefined') {
      hasWarnedAboutMissingConfig = true
      console.info('[Zero AI] Running in offline mode - add Supabase credentials for cloud features')
    }
    return createMockClient()
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
