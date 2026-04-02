'use client'

import Logo from './Logo'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-surface-border py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <Logo className="text-lg" />
            <p className="text-gray-500 text-sm leading-relaxed">Fotos inmobiliarias con IA</p>
          </div>

          {/* Producto */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-semibold uppercase tracking-wider">Producto</p>
            <nav className="flex flex-col gap-2">
              <Link href="/#antes-despues" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Features</Link>
              <Link href="/pricing" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Pricing</Link>
              <Link href="/auth" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Demo gratis</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-semibold uppercase tracking-wider">Legal</p>
            <nav className="flex flex-col gap-2">
              <Link href="/legal/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacidad</Link>
              <Link href="/legal/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Términos</Link>
            </nav>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-semibold uppercase tracking-wider">Contacto</p>
            <nav className="flex flex-col gap-2">
              <a href="mailto:hola@photoagent.pro" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">hola@photoagent.pro</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">LinkedIn</a>
            </nav>
          </div>
        </div>

        <div className="border-t border-surface-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2025 PhotoAgent · Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-700">Hecho con IA en España 🇪🇸</p>
        </div>
      </div>
    </footer>
  )
}
