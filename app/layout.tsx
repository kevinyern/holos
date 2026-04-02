import type { Metadata } from 'next'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'PhotoAgent — Fotos inmobiliarias profesionales con IA en 30 segundos',
  description: 'Convierte fotos de móvil en imágenes de agencia. Sin fotógrafo, sin Photoshop. Sube la foto y la IA la transforma en 30 segundos.',
  keywords: [
    'fotos inmobiliarias IA',
    'fotografía inmobiliaria inteligencia artificial',
    'mejorar fotos piso vender',
    'fotos agencia inmobiliaria automática',
    'edición fotos inmuebles IA',
    'Idealista fotos profesionales',
    'Fotocasa fotos agencia',
    'virtual staging españa',
  ],
  openGraph: {
    title: 'PhotoAgent — Fotos inmobiliarias profesionales con IA en 30 segundos',
    description: 'Convierte fotos de móvil en imágenes de agencia. Sin fotógrafo, sin Photoshop. Sube la foto y la IA la transforma en 30 segundos.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'PhotoAgent — Antes y después con IA' }],
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoAgent — Fotos inmobiliarias profesionales con IA en 30 segundos',
    description: 'Convierte fotos de móvil en imágenes de agencia. Sin fotógrafo, sin Photoshop. Sube la foto y la IA la transforma en 30 segundos.',
    images: ['/images/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
