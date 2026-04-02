import Link from 'next/link'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FooterSection } from '@/components/landing/footer-section'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-0/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zero-200 to-zero-400" />
            <span className="text-lg font-medium text-text-1">Zero AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className="hidden text-sm text-text-2 transition-colors hover:text-text-1 sm:block"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden text-sm text-text-2 transition-colors hover:text-text-1 sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/chat"
              className="rounded-full bg-zero-300 px-4 py-2 text-sm font-medium text-bg-0 transition-all hover:bg-zero-400"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />

      {/* Pricing */}
      <PricingSection />

      {/* Footer */}
      <FooterSection />
    </main>
  )
}
