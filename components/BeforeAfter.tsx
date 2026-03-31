'use client'

import { motion } from 'framer-motion'

const comparisons = [
  {
    label: 'Foto profesional con IA',
    beforeText: 'Foto del móvil',
    afterText: 'Procesada con Holos',
  },
  {
    label: 'Virtual staging',
    beforeText: 'Habitación vacía',
    afterText: 'Amueblada con IA',
  },
  {
    label: 'Relighting',
    beforeText: 'Iluminación pobre',
    afterText: 'Atardecer dorado',
  },
]

export default function BeforeAfter() {
  return (
    <section id="antes-despues" className="py-24 px-6 bg-surface-light">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Resultados reales
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Antes y después
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Resultados generados en menos de 30 segundos. Sin Photoshop. Sin fotógrafo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {comparisons.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-sm font-medium text-accent mb-4">{item.label}</p>
              <div className="space-y-3">
                {/* Before */}
                <div className="relative aspect-[4/3] rounded-xl bg-surface-card border border-surface-border overflow-hidden">
                  <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    Antes
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <p className="text-xs">{item.beforeText}</p>
                    </div>
                  </div>
                </div>
                {/* After */}
                <div className="relative aspect-[4/3] rounded-xl bg-gradient-to-br from-surface-card to-accent/5 border border-accent/20 overflow-hidden">
                  <div className="absolute top-3 left-3 bg-accent/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    Después
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                      <p className="text-xs">{item.afterText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
