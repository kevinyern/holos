'use client'

import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section id="contacto" className="py-16 md:py-32 px-4 sm:px-6 border-t border-surface-border">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Tu próximo anuncio con fotos de agencia.
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-lg mx-auto">
            Empieza hoy con 10 fotos gratis. Sin tarjeta.
          </p>

          <div className="flex justify-center px-2">
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
            >
              Empezar gratis ahora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </div>

          <p className="text-gray-500 text-sm mt-5">
            🔒 Tus fotos son privadas. Eliminadas a los 30 días.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
