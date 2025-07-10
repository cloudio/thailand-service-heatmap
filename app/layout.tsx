import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thailand Province Population Map',
  description: 'Interactive map showing population of Thailand provinces',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}