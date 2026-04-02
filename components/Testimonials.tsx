'use client'

import { motion } from 'framer-motion'

const benefits = [
  {
    icon: '💰',
    title: 'Ahorra 150€ por propiedad',
    description: 'Un fotógrafo cobra 150-300€. Aquí son centavos por foto.',
  },
  {
    icon: '⚡',
    title: 'De la visita al anuncio en 10 minutos',
    description: 'Haces las fotos, subes, descargas. Sin esperar al fotógrafo.',
  },
  {
    icon: '📈',
    title: 'Más clics en Idealista',
    description: 'Las fotos profesionales generan hasta 3x más contactos en portales.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-surface-border">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Por qué los agentes lo eligen
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-surface-card border border-surface-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-shadow text-center"
            >
              <div className="text-4xl">{b.icon}</div>
              <h3 className="text-white text-lg font-semibold">{b.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
