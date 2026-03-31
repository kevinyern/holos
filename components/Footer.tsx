'use client'

import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-surface-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Logo className="text-lg" />
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Términos</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Contacto</a>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          © 2026 Holos. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
