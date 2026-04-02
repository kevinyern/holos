'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

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
            Comprueba la diferencia.<br />En 30 segundos.
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-lg mx-auto">
            Sube una foto de móvil y ve cómo queda con calidad de agencia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
            >
              Empezar ahora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
            <motion.a
              href="/pricing"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto border border-surface-border hover:border-gray-500 text-gray-300 hover:text-white font-medium px-10 py-4 rounded-xl text-lg transition-all flex items-center justify-center"
            >
              Ver planes
            </motion.a>
          </div>

          <p className="text-gray-500 text-sm mt-5">
            🔒 Tus fotos son privadas. Eliminadas a los 30 días.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Sin tarjeta · Sin compromiso · Resultado en 30 segundos
          </p>
        </motion.div>
      </div>
    </section>
  )
}
