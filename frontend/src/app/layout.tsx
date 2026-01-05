import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillProof - Verify Skills, Hire Talent',
  description: 'Skill verification and hiring platform focused on real skills over degrees and certificates. Validate developers through actual GitHub projects, AI-based code analysis, and expert review.',
  keywords: ['skill verification', 'hiring platform', 'developer assessment', 'code analysis', 'GitHub projects'],
  authors: [{ name: 'SkillProof Team' }],
  openGraph: {
    title: 'SkillProof - Verify Skills, Hire Talent',
    description: 'Skill verification and hiring platform focused on real skills over degrees and certificates.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillProof - Verify Skills, Hire Talent',
    description: 'Skill verification and hiring platform focused on real skills over degrees and certificates.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4aed88',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ff6b6b',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
