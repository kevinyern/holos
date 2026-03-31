'use client'

import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    price: '197',
    period: '/mes',
    description: 'Para agentes independientes',
    properties: '100 fotos/mes',
    features: [
      'Enhancement profesional con IA',
      'Relighting (4 luces)',
      'Hasta 5 proyectos activos',
      'Galería antes/después',
      'Descarga en alta resolución',
      'Soporte por email',
    ],
    cta: 'Empezar ahora',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '397',
    period: '/mes',
    description: 'Para equipos en crecimiento',
    properties: '500 fotos/mes',
    features: [
      'Todo lo de Starter',
      'Hasta 20 proyectos activos',
      'Procesado en paralelo',
      'Soporte prioritario',
    ],
    cta: 'Empezar ahora',
    highlighted: true,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Precios
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Un plan para cada agencia
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Sin compromiso. Cancela cuando quieras. 14 días de prueba gratis en todos los planes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-accent/10 to-surface-card border-2 border-accent/40'
                  : 'bg-surface-card border border-surface-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Más popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-bold">{plan.price}€</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <p className="text-accent text-sm font-medium mb-6">
                {plan.properties}
              </p>

              <button
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all mb-8 ${
                  plan.highlighted
                    ? 'bg-accent hover:bg-accent-light text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                    : 'bg-surface-light border border-surface-border hover:border-gray-600 text-white'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <svg
                      className="w-4 h-4 text-accent mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
