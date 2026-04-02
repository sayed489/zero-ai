'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, Github, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient()
    setIsOAuthLoading(provider)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-bg-0 p-6">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-zero-500/5 via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <ZeroMascot size={80} state="wink" interactive={false} />
          <h1 className="mt-4 text-2xl font-bold text-text-1">Create your account</h1>
          <p className="mt-2 text-center text-text-2">
            Join Zero and start chatting with AI
          </p>
        </div>

        <div className="rounded-2xl border border-border-1 bg-bg-1 p-8 shadow-xl">
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 border-border-1 bg-bg-0 py-6 text-text-1 hover:bg-bg-2"
              onClick={() => handleOAuthLogin('google')}
              disabled={!!isOAuthLoading}
            >
              {isOAuthLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 border-border-1 bg-bg-0 py-6 text-text-1 hover:bg-bg-2"
              onClick={() => handleOAuthLogin('github')}
              disabled={!!isOAuthLoading}
            >
              {isOAuthLoading === 'github' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border-1" />
            <span className="text-sm text-text-3">or</span>
            <div className="h-px flex-1 bg-border-1" />
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text-2">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border-1 bg-bg-0 py-5 text-text-1 placeholder:text-text-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-2">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border-1 bg-bg-0 py-5 text-text-1 placeholder:text-text-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-2">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border-1 bg-bg-0 py-5 text-text-1 placeholder:text-text-3"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2 bg-zero-500 py-6 text-white hover:bg-zero-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-2">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-zero-400 hover:text-zero-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-3">
          By continuing, you agree to Zero&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
