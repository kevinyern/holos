'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Carlos Mendoza',
    role: 'Agente Senior · Engel & Völkers Madrid',
    result: 'Ahorra 150€/foto en fotografía',
    text: 'En 30 segundos tengo fotos que antes me costaban 150€ con fotógrafo. Mis anuncios se venden en la mitad de tiempo.',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=1e40af&color=fff&size=80',
  },
  {
    name: 'Laura Puig',
    role: 'Directora Comercial · RE/MAX Barcelona',
    result: 'Ahorra 200€/mes en fotografía',
    text: 'Lo usamos con todo el equipo. La calidad es brutal para ser automático. Nuestros clientes no saben que no hay fotógrafo.',
    avatar: 'https://ui-avatars.com/api/?name=Laura+Puig&background=0f766e&color=fff&size=80',
  },
  {
    name: 'Javier Romero',
    role: 'Agente Inmobiliario · Century 21 Valencia',
    result: 'Publica en Idealista en 30 segundos',
    text: 'Antes tardaba días en tener fotos decentes. Ahora subo la foto del móvil y en medio minuto está lista para Idealista.',
    avatar: 'https://ui-avatars.com/api/?name=Javier+Romero&background=7c3aed&color=fff&size=80',
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
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">Lo que dicen los agentes</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Resultados reales.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">Agentes reales.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-surface-card border border-surface-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-shadow"
            >
              {/* Stars */}
              <div className="text-yellow-400 text-base tracking-wide">⭐⭐⭐⭐⭐</div>

              <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>

              {/* Result badge */}
              <div className="border-t border-surface-border pt-3">
                <p className="text-accent text-xs font-semibold">✓ {t.result}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
