'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Github, Mail, Command, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Auto-redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/chat')
    })
  }, [])

  const handleOAuthLogin = async (provider: 'github' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setMessage({ text: 'Check your email for the magic link!', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-0 px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-bg-1 p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zero-300 to-zero-600 shadow-lg shadow-zero-500/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-1">
            Welcome to Zero AI
          </h2>
          <p className="mt-2 text-sm text-text-3">
            Build the future at the speed of thought.
          </p>
        </div>

        {/* Auth Methods */}
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleOAuthLogin('discord')}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#4752C4] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:ring-offset-bg-1"
          >
            {/* Discord SVG Icon */}
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Continue with Discord
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292F] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1b1f23] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#24292F] focus:ring-offset-2 focus:ring-offset-bg-1"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-bg-1 px-3 text-text-3">Or continue with magic link</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-text-3" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-border bg-bg-0 py-3.5 pl-11 pr-4 text-text-1 placeholder:text-text-3 focus:border-zero-500 focus:outline-none focus:ring-1 focus:ring-zero-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {message && (
            <div className={`rounded-xl p-3 text-sm ${
              message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-text-1 px-4 py-3.5 text-sm font-semibold text-bg-0 transition-all hover:bg-text-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-bg-0 border-t-transparent" />
            ) : (
             <>
               Send Magic Link
               <Command className="h-4 w-4 opacity-50" />
             </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-text-3">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="font-medium text-zero-400 hover:text-zero-300 transition-colors"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}
