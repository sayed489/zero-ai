import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-bg-0 p-6">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center">
          <ZeroMascot size={100} state="error" interactive={false} />
          <h1 className="mt-6 text-2xl font-bold text-text-1">Something went wrong</h1>
          <p className="mt-3 text-text-2">
            We couldn&apos;t complete the authentication process. Please try again.
          </p>
        </div>

        <div className="rounded-2xl border border-border-1 bg-bg-1 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-sm text-text-3">
            This could happen if your login link expired or was already used.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="flex-1" variant="outline">
              <Link href="/auth/login">Try Again</Link>
            </Button>
            <Button asChild className="flex-1 bg-zero-500 hover:bg-zero-600">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
