'use client'

import React from 'react'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    planKey: 'starter',
    price: '79',
    period: '/mes',
    description: 'Para agentes que empiezan',
    quota: '150 fotos/mes',
    features: [
      'Foto movil a foto profesional con IA',
      'Relighting 4 momentos del dia',
      'Hasta 10 proyectos activos',
      'Galeria antes/despues',
      'Descarga en alta resolucion',
      'Soporte por email',
    ],
    cta: 'Empezar',
    highlighted: false,
  },
  {
    name: 'Professional',
    planKey: 'pro',
    price: '199',
    period: '/mes',
    description: 'Para agencias en crecimiento',
    quota: '750 fotos/mes',
    features: [
      'Todo lo del Starter',
      'Virtual staging con IA',
      'Personalizacion de estilo',
      'Reforma virtual',
      'Soporte prioritario',
      'Hasta 50 proyectos activos',
    ],
    cta: 'Empezar',
    highlighted: true,
  },
  {
    name: 'Agency',
    planKey: 'agency',
    price: '699',
    period: '/mes',
    description: 'Para agencias grandes',
    quota: '2.000 fotos/mes',
    features: [
      'Todo lo del Professional',
      'Marca blanca',
      'Tour 3D navegable (Marble)',
      'Acceso anticipado a nuevas features',
      'Soporte dedicado',
      'Proyectos ilimitados',
    ],
    cta: 'Empezar',
    highlighted: false,
  },
]

const FAQ_ITEMS = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, sin permanencia ni penalizaciones. Cancelas cuando quieras desde tu perfil y no se te cobra nada más.',
  },
  {
    q: '¿Qué pasa con mis fotos?',
    a: 'Son tuyas. Las mantenemos disponibles mientras tengas cuenta activa. Si cancelas, las eliminamos tras 30 días.',
  },
  {
    q: '¿Funciona con cualquier tipo de foto?',
    a: 'Sí. Aceptamos JPEG, PNG y HEIC con un máximo de 20 MB por foto. Cuanto mejor la foto original, mejor el resultado.',
  },
  {
    q: '¿Cuánto tarda en procesarse una foto?',
    a: 'Unos 30 segundos por foto. En proyectos grandes con varias fotos el tiempo se multiplica, pero siempre ves el progreso en tiempo real.',
  },
  {
    q: '¿Ofrecéis factura?',
    a: 'Sí. Stripe genera automáticamente un recibo tras cada pago. Para factura con IVA, escríbenos a hola@photoagent.pro con tus datos fiscales.',
  },
]

function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(null)
  return (
    <div className="max-w-2xl mx-auto mt-20 px-4 sm:px-0">
      <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10">Preguntas frecuentes</h3>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
            >
              <span className="text-sm font-semibold text-white">{item.q}</span>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-6 pb-5">
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Pricing() {
  const [loading, setLoading] = React.useState<string | null>(null)
  const priceIds: Record<string, string> = {
    starter: 'price_1THUl7E34bxXGSTLzCwc119N',
    pro: 'price_1THUlYE34bxXGSTLvOyUVl9E',
    agency: 'price_1THUm1E34bxXGSTLSxaVRSnF',
  }

  const checkout = async (planKey: string) => {
    setLoading(planKey)
    try {
      const priceId = priceIds[planKey]
      if (!priceId) {
        setLoading(null)
        return
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.redirect) {
        window.location.href = data.redirect
      } else {
        alert('Error al conectar con Stripe: ' + (data.error || 'Sin respuesta'))
      }
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
    setLoading(null)
  }

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Un plan para cada agencia
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Sin compromiso. Cancela cuando quieras.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium px-5 py-2.5 rounded-full">
            ✅ 7 días de prueba gratis en todos los planes &middot; Sin tarjeta de crédito
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted
                  ? 'bg-accent/10 border-accent shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                  : 'bg-surface-card border-surface-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    ⭐ Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm">EUR{plan.period}</span>
              </div>
              <p className="text-accent text-sm font-medium mb-6">{plan.quota}</p>

              <button
                onClick={() => checkout(plan.planKey)}
                disabled={loading === plan.planKey}
                className={`w-full py-3 min-h-[48px] rounded-xl font-medium text-sm transition-all mb-8 disabled:opacity-60 ${
                  plan.highlighted
                    ? 'bg-accent hover:bg-accent-light text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                    : 'bg-surface-light border border-surface-border hover:border-gray-600 text-white'
                }`}
              >
                {loading === plan.planKey ? 'Cargando...' : plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>


        {/* Tabla comparativa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold text-center mb-8">Comparativa de planes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-white font-semibold">Starter</th>
                  <th className="text-center py-3 px-4 text-accent font-semibold">Professional</th>
                  <th className="text-center py-3 px-4 text-white font-semibold">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {[
                  ['Fotos/mes', '150', '750', '2.000'],
                  ['Virtual staging', '❌', '✅', '✅'],
                  ['Reforma virtual', '❌', '✅', '✅'],
                  ['Marca blanca', '❌', '❌', '✅'],
                  ['Tour 3D (Marble)', '❌', '❌', '✅'],
                  ['Soporte', 'Email', 'Prioritario', 'Dedicado'],
                ].map(([feature, starter, pro, agency]) => (
                  <tr key={feature} className="hover:bg-surface-card/50 transition-colors">
                    <td className="py-3.5 px-4 text-gray-300 font-medium">{feature}</td>
                    <td className="py-3.5 px-4 text-center text-gray-400">{starter}</td>
                    <td className="py-3.5 px-4 text-center text-accent font-medium">{pro}</td>
                    <td className="py-3.5 px-4 text-center text-gray-400">{agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <FAQSection />
      </div>
    </section>
  )
}
