import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-bg-0 p-6">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-zero-500/5 via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center">
          <ZeroMascot size={100} state="celebrating" interactive={false} />
          <h1 className="mt-6 text-2xl font-bold text-text-1">Check your email</h1>
          <p className="mt-3 text-text-2">
            We&apos;ve sent you a confirmation link. Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="rounded-2xl border border-border-1 bg-bg-1 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zero-500/10">
            <Mail className="h-8 w-8 text-zero-400" />
          </div>
          <p className="text-sm text-text-3">
            Didn&apos;t receive the email? Check your spam folder or try signing up again.
          </p>
          <Button asChild className="mt-6 w-full" variant="outline">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
