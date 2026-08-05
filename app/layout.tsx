import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'WHITMORE//AU — Distributorship Console',
  description:
    'Terminal console for the Whitmore Australia distributorship: open gear lubricants, enclosed gearbox oils, extreme-pressure greases and the dragline range — and the business case for moving off asphaltics.',
  keywords: [
    'Whitmore',
    'open gear lubricant',
    'OGL',
    'dragline',
    'gearbox oil',
    'synthetic lubricant',
    'asphaltic',
    'Australia',
    'mining lubricants',
  ],
  openGraph: {
    title: 'WHITMORE//AU — Distributorship Console',
    description:
      'Asphaltics out, synthetics in. The Australian distributorship case for the Whitmore mining lubricant range.',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#060504',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-theme="amber" className={mono.variable}>
      <body>{children}</body>
    </html>
  )
}
