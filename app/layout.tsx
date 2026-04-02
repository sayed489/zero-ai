import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Zero AI — Think freely.',
  description: 'The AI that remembers you. Multi-model routing, persistent memory, and smart features that actually help.',
  keywords: ['AI', 'assistant', 'chat', 'memory', 'Zero AI', 'artificial intelligence'],
  authors: [{ name: 'Zero AI' }],
  creator: 'Zero AI',
  metadataBase: new URL('https://zero-ai.tech'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zero-ai.tech',
    title: 'Zero AI — Think freely.',
    description: 'The AI that remembers you. Multi-model routing, persistent memory, and smart features that actually help.',
    siteName: 'Zero AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zero AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero AI — Think freely.',
    description: 'The AI that remembers you.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5ff' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e10' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
