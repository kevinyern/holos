import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Holos — Fotos inmobiliarias con IA',
  description: 'Transforma las fotos de tus propiedades con inteligencia artificial. Relighting, virtual staging, tours 3D y más.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
