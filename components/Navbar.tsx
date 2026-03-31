'use client'

import { motion } from 'framer-motion'
import Logo from './Logo'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo className="text-xl" />
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#como-funciona" className="hover:text-white transition-colors">
            Cómo funciona
          </a>
          <a href="#antes-despues" className="hover:text-white transition-colors">
            Resultados
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Precios
          </a>
        </div>
        <a
          href="#pricing"
          className="bg-accent hover:bg-accent-light text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Empieza gratis
        </a>
      </div>
    </motion.nav>
  )
}
