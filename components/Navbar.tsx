'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'bg-surface/80 backdrop-blur-xl border-surface-border'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo className="text-xl" />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="/#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="/#antes-despues" className="hover:text-white transition-colors">Resultados</a>
            <a href="/demo" className="hover:text-white transition-colors">Demo</a>
            <a href="/pricing" className="hover:text-white transition-colors">Planes</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a href="/auth" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">
              Entrar
            </a>
            <a
              href="/auth"
              className="hidden sm:flex bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Empieza gratis →
            </a>

            {/* Mobile: CTA compacto + hamburger */}
            <a
              href="/auth"
              className="sm:hidden bg-accent hover:bg-accent-light text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              Gratis →
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-surface-border md:hidden"
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              <a href="/#como-funciona" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-3 px-3 rounded-xl hover:bg-surface-card transition-colors text-sm font-medium">
                Cómo funciona
              </a>
              <a href="/#antes-despues" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-3 px-3 rounded-xl hover:bg-surface-card transition-colors text-sm font-medium">
                Resultados
              </a>
              <a href="/demo" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-3 px-3 rounded-xl hover:bg-surface-card transition-colors text-sm font-medium">
                Demo
              </a>
              <a href="/pricing" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-3 px-3 rounded-xl hover:bg-surface-card transition-colors text-sm font-medium">
                Planes
              </a>
              <div className="border-t border-surface-border my-2" />
              <a href="/auth" className="text-gray-400 hover:text-white py-3 px-3 rounded-xl hover:bg-surface-card transition-colors text-sm">
                Entrar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
