'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Sube tu foto',
    description: 'Cualquier foto hecha con el móvil. Sin preparación, sin requisitos técnicos.',
    detail: 'Formatos: JPG, HEIC, PNG. Desde cualquier dispositivo.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'La IA lo transforma',
    description: 'Luz, perspectiva, orden, color. Corregido y mejorado automáticamente en menos de 30 segundos.',
    detail: 'Sin Photoshop. Sin fotógrafo. Sin esperar.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Descarga y publica',
    description: 'Imagen de agencia lista para Idealista, Fotocasa y redes sociales. Impacto inmediato en tu anuncio.',
    detail: 'Más visitas. Más contactos. Más ventas.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-surface-border">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">¿Cómo funciona?</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            De foto cutre a foto pro{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">en un solo clic.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Línea conectora en desktop */}
          <div className="hidden md:block absolute top-10 left-[17%] right-[17%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-surface-card border border-surface-border rounded-2xl p-7 text-center hover:border-accent/30 transition-colors overflow-hidden"
            >
              {/* Número grande decorativo */}
              <span className="absolute top-3 right-4 text-6xl font-bold text-gray-800/20 leading-none pointer-events-none select-none">
                {step.number}
              </span>
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-5 relative z-10">
                {step.icon}
              </div>
              <span className="text-xs font-mono text-accent/50 block mb-2 relative z-10">{step.number}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              <p className="text-accent/60 text-xs mt-3 font-medium">{step.detail}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
