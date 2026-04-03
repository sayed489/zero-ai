'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Github, Mail, Command, Sparkles, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

import { Suspense } from 'react'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Handle URL params
  useEffect(() => {
    const errorMsg = searchParams.get('error_description') || searchParams.get('error')
    if (errorMsg) setMessage({ text: errorMsg, type: 'error' })
      
    // Auto-redirect if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/chat')
    })
  }, [searchParams, router, supabase])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      let { error, data } = { error: null as any, data: null as any }

      if (mode === 'signup') {
        ({ error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }))
        if (error) throw error
        setMessage({ 
          text: data?.user?.identities?.length === 0 
            ? 'User already exists, please sign in instead.' 
            : 'Check your email to confirm your account.', 
          type: 'success' 
        })
      } 
      
      else if (mode === 'signin') {
        ({ error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        }))
        if (error) throw error
        router.replace('/chat')
      } 
      
      else if (mode === 'magic') {
        ({ error, data } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }))
        if (error) throw error
        setMessage({ text: 'Check your email for the magic link!', type: 'success' })
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-0 px-4 py-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-border/50 bg-bg-1 p-8 shadow-2xl relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-zero-500/10 blur-[100px] pointer-events-none rounded-full" />
        
        {/* Header */}
        <div className="text-center relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zero-300 to-zero-600 shadow-lg shadow-zero-500/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-1">
            {mode === 'signup' ? 'Create an Account' : mode === 'signin' ? 'Welcome back' : 'Passwordless Login'}
          </h2>
          <p className="mt-2 text-sm text-text-3">
            {mode === 'signup' 
              ? 'Join Zero and build at the speed of thought.' 
              : 'Sign in to Zero AI to continue building.'}
          </p>
        </div>

        {/* OAuth Buttons - Optional, hiding during signup to keep focus */}
        {mode !== 'magic' && (
          <div className="mt-8 space-y-3 relative z-10">
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292F] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1b1f23] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#24292F] focus:ring-offset-2 focus:ring-offset-bg-1"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('discord')}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#4752C4] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:ring-offset-bg-1"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Continue with Discord
            </button>

            <div className="relative mt-8 py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-bg-1 px-3 text-text-3">Or with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
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
                  className="block w-full rounded-xl border border-border bg-bg-0/50 py-3.5 pl-11 pr-4 text-text-1 placeholder:text-text-3 focus:border-zero-500 focus:outline-none focus:ring-1 focus:ring-zero-500 sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode !== 'magic' && (
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-text-3" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={mode === 'signup' ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-bg-0/50 py-3.5 pl-11 pr-4 text-text-1 placeholder:text-text-3 focus:border-zero-500 focus:outline-none focus:ring-1 focus:ring-zero-500 sm:text-sm transition-colors"
                    placeholder={mode === 'signup' ? "Create a password (min 6 chars)" : "Password"}
                  />
                </div>
              </div>
            )}
          </div>

          {message && (
            <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
              message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-zero-500/10 text-zero-400 border border-zero-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || (mode !== 'magic' && !password)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-text-1 px-4 py-3.5 text-sm font-semibold text-bg-0 transition-all hover:bg-text-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-bg-0 border-t-transparent" />
            ) : (
             <>
               {mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Sign In' : 'Send Magic Link'}
               <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
             </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 flex flex-col items-center gap-4 text-sm relative z-10">
          {mode === 'signin' && (
            <>
              <div className="text-text-3">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-medium text-zero-400 hover:text-zero-300 transition-colors">
                  Sign up
                </button>
              </div>
              <button type="button" onClick={() => setMode('magic')} className="text-text-3 hover:text-text-1 transition-colors flex items-center gap-1.5">
                <Command className="h-3 w-3" /> Use Magic Link instead
              </button>
            </>
          )}
          
          {mode === 'signup' && (
            <div className="text-text-3">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('signin')} className="font-medium text-zero-400 hover:text-zero-300 transition-colors">
                Sign in
              </button>
            </div>
          )}
          
          {mode === 'magic' && (
            <button type="button" onClick={() => setMode('signin')} className="text-text-3 hover:text-text-1 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Password Login
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg-0 text-text-3">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
