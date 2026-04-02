import Link from 'next/link'
import { Twitter } from 'lucide-react'

export function FooterSection() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-zero-200 to-zero-400" />
            <span className="font-medium text-text-1">Zero AI</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-text-2 hover:text-text-1">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-text-2 hover:text-text-1">
              Terms
            </Link>
            <a
              href="https://twitter.com/zeroai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-2 hover:text-text-1"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-text-3">
            zero-ai.tech
          </p>
        </div>
      </div>
    </footer>
  )
}
