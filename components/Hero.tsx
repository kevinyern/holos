'use client'

import { motion } from 'framer-motion'

// ─── ANIMATED SLIDER ─────────────────────────────────────────────────────────

function BeforeAfterStatic() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <img src="/images/hero-antes.jpeg" alt="Antes" className="w-full object-cover" loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 left-3">
          <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">Antes</span>
        </div>
      </div>
      <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <img src="/images/hero-despues.jpeg" alt="Después" className="w-full object-cover" loading="eager" decoding="async" />
        <div className="absolute top-3 left-3">
          <span className="bg-accent/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">Después</span>
        </div>
      </div>
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-28 px-4 sm:px-6 overflow-hidden">
      {/* Dual blobs — más dramáticos */}
      <div className="absolute top-[-80px] left-[-120px] w-[700px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-100px] w-[600px] h-[500px] bg-purple-700/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Copy centrado */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5"
          >
            <span className="text-white">De foto de móvil a foto de agencia.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
              En 30 segundos.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-gray-400 text-base md:text-xl max-w-xl mx-auto mb-9 leading-relaxed px-2"
          >
            Sube la foto como salga. La IA corrige luz, orden y calidad automáticamente. Lista para Idealista en 30 segundos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="flex justify-center px-2"
          >
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
            >
              Probar gratis — 10 fotos sin tarjeta
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>

        {/* Slider animado */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="relative"
        >
          <div className="max-w-4xl mx-auto">
            <BeforeAfterStatic />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-accent/15 blur-3xl rounded-full" />
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            ✓ Sin tarjeta de crédito
            <span className="mx-3 text-gray-700">·</span>
            ✓ 10 fotos gratis
            <span className="mx-3 text-gray-700">·</span>
            ✓ Resultado en 30 segundos
          </p>
        </motion.div>

      </div>
    </section>
  )
}
