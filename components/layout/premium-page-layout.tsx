import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'

interface PremiumPageLayoutProps {
  title: string
  description?: string
  icon?: React.ReactNode
  maxWidth?: string
  children: React.ReactNode
  disableProse?: boolean
}

export function PremiumPageLayout({
  title,
  description,
  icon,
  maxWidth = 'max-w-4xl',
  children,
  disableProse = false
}: PremiumPageLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-0 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-1/80 backdrop-blur-md shrink-0">
        <div className={`mx-auto flex w-full ${maxWidth} items-center gap-4 px-4 py-4`}>
          <Link href="/chat" className="flex items-center gap-2 text-text-2 hover:text-text-1 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ZeroMascot size={32} state="idle" interactive={false} />
          <h1 className="text-lg font-medium text-text-1">{title}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className={`mx-auto w-full ${maxWidth} px-4 py-8`}>
          {(icon || title || description) && (
            <div className="mb-8 flex items-start gap-4">
              {icon && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-2 p-2.5 shadow-sm border border-border">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-1">{title}</h1>
                {description && (
                  <p className="mt-2 text-lg text-text-2">{description}</p>
                )}
              </div>
            </div>
          )}

          <div className={disableProse ? '' : 'prose prose-zinc dark:prose-invert max-w-none text-text-2'}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
