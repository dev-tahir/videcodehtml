import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AI Page Creator - Create Beautiful HTML Pages with AI',
  description: 'Transform your ideas into stunning HTML pages using AI. Edit with precision using intelligent line-stitching technology.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
