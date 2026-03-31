'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Gradient orb background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-surface-card border border-surface-border rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Usado por +200 agencias en España
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          Convierte fotos mediocres{' '}
          <br className="hidden md:block" />
          en{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
            ventas reales
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          IA que transforma las fotos de tus propiedades en imágenes profesionales,
          amuebla habitaciones vacías y crea tours 3D. Todo en minutos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#pricing"
            className="bg-accent hover:bg-accent-light text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            Empieza gratis →
          </a>
          <a
            href="#como-funciona"
            className="border border-surface-border hover:border-gray-600 text-white font-medium px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Ver demo
          </a>
        </motion.div>

        {/* Hero image placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="aspect-[16/9] max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-surface-card to-surface-light border border-surface-border overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <p className="text-sm">Dashboard de Holos — Preview del producto</p>
              </div>
            </div>
          </div>
          {/* Glow effect under the image */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-accent/20 blur-3xl rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}
