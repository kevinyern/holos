'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const stats = [
  { value: '~30 seg', label: 'Tiempo de procesado', description: 'Por foto' },
  { value: '150€', label: 'Ahorro medio por piso', description: 'vs fotógrafo profesional' },
  { value: '79€/mes', label: 'Plan de entrada', description: '100 fotos incluidas' },
]

function StatCard({ value, label, description, delay }: { value: string; label: string; description: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setVisible(true), delay * 1000)
      return () => clearTimeout(t)
    }
  }, [isInView, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-surface-card border border-surface-border rounded-2xl p-8 text-center flex flex-col gap-2"
    >
      <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-accent text-sm font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-gray-500 text-xs mt-1">{description}</div>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 border-t border-surface-border">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}
