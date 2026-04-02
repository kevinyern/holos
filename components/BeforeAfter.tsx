'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

// ─── DATOS ───────────────────────────────────────────────────────────────────

const relightingImages = [
  { label: 'Día',      src: '/images/dia.jpeg',       emoji: '☀️' },
  { label: 'Amanecer', src: '/images/amanecer.jpeg',  emoji: '🌅' },
  { label: 'Noche',    src: '/images/anochecer.jpeg', emoji: '🌙' },
]

const beforeAfterPairs = [
  { before: '/images/orden-antes.jpeg',    after: '/images/orden-despues.jpeg',    label: 'Foto de móvil → Foto pro' },
  { before: '/images/antes-obra-1.jpeg',   after: '/images/despues-obra-1.jpeg',   label: 'Reforma integral' },
  { before: '/images/antes-obra-2.jpeg',   after: '/images/despues-obra-2.jpeg',   label: 'Reforma visualizada' },
]

// ─── RELIGHTING ───────────────────────────────────────────────────────────────

const relightingMeta = [
  { color: 'from-sky-400/20 to-sky-600/10', glow: 'shadow-sky-500/20', ring: 'ring-sky-400/50', text: 'text-sky-300' },
  { color: 'from-orange-400/20 to-orange-600/10', glow: 'shadow-orange-500/30', ring: 'ring-orange-400/60', text: 'text-orange-300' },
  { color: 'from-indigo-400/20 to-indigo-600/10', glow: 'shadow-indigo-500/20', ring: 'ring-indigo-400/50', text: 'text-indigo-300' },
]

function RelightingStrip() {
  // Amanecer (índice 1) predeterminado
  const [active, setActive] = useState(1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-accent font-medium text-sm uppercase tracking-wider mb-5">Una foto. Tres iluminaciones.</p>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight">La misma foto.<br className="hidden sm:block" /> Más formas de vender.</h3>
      </div>

      {/* Imagen grande */}
      <div className={`relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl ${relightingMeta[active].glow}`}>
        {relightingImages.map((img, i) => (
          <motion.img
            key={img.src}
            src={img.src}
            alt={img.label}
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{ opacity: active === i ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
        ))}
        {/* Badge activo */}
        <div className="absolute top-4 left-4 z-10">
          <motion.span
            key={active}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-semibold px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm ${relightingMeta[active].text}`}
          >
            {relightingImages[active].emoji} {relightingImages[active].label}
          </motion.span>
        </div>
      </div>

      {/* Botones con más presencia */}
      <div className="flex gap-3 mt-6">
        {relightingImages.map((img, i) => {
          const meta = relightingMeta[i]
          const isActive = active === i
          return (
            <button
              key={img.label}
              onClick={() => setActive(i)}
              className={`relative flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 overflow-hidden
                ${isActive
                  ? `bg-gradient-to-br ${meta.color} ${meta.text} border-transparent ring-2 ${meta.ring} scale-[1.03] shadow-lg`
                  : 'bg-surface-card border-surface-border text-gray-500 hover:text-gray-200 hover:border-gray-500 hover:scale-[1.01]'
                }`}
            >
              {/* Glow bg on active */}
              {isActive && (
                <span className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-60`} />
              )}
              <span className="relative text-lg">{img.emoji}</span>
              <span className="relative tracking-wide">{img.label}</span>
              {isActive && (
                <span className="relative w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse ml-1" />
              )}
            </button>
          )
        })}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-gray-600 mt-4 mb-0">Pulsa cada botón para cambiar la iluminación</p>
    </div>
  )
}

// ─── SLIDER ANTES/DESPUÉS ────────────────────────────────────────────────────

function SliderCard({ before, after, label }: { before: string; after: string; label: string }) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col"
    >
      <div
        ref={containerRef}
        className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-surface-border shadow-lg cursor-col-resize select-none"
        onMouseDown={(e) => { dragging.current = true; update(e.clientX) }}
        onMouseMove={(e) => { if (dragging.current) update(e.clientX) }}
        onMouseUp={() => { dragging.current = false }}
        onMouseLeave={() => { dragging.current = false }}
        onTouchStart={(e) => { e.preventDefault(); update(e.touches[0].clientX) }}
        onTouchMove={(e) => { e.preventDefault(); update(e.touches[0].clientX) }}
      >
        <img src={after} alt="Después" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={before} alt="Antes" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
        <div className="absolute top-0 bottom-0 w-[3px] z-10" style={{ left: `${position}%`, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.9) 20%, white 50%, rgba(255,255,255,0.9) 80%, transparent)', boxShadow: '0 0 16px 2px rgba(255,255,255,0.7)' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
            </svg>
          </div>
        </div>
        <span className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">Antes</span>
        <span className="absolute top-3 right-3 z-20 bg-accent/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">Después</span>
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-gray-500">Arrastra para comparar</span>
      </div>
      <div className="mt-2 flex justify-center">
        <span className="bg-accent/20 border border-accent/40 text-accent text-xs font-semibold px-3 py-1 rounded-full tracking-wide">IA · 30 segundos</span>
      </div>
    </motion.div>
  )
}

// ─── SECCIÓN PRINCIPAL ───────────────────────────────────────────────────────

const fotoProPairs = [
  { before: '/images/orden-antes-2.jpeg', after: '/images/orden-despues-2.jpeg', label: 'Foto de móvil → Foto pro' },
  { before: '/images/orden-antes-3.jpeg', after: '/images/orden-despues-3.jpeg', label: 'Foto de móvil → Foto pro' },
  { before: '/images/orden-antes-4.jpeg', after: '/images/orden-despues-4.jpeg', label: 'Foto de móvil → Foto pro' },
]
const obraPairs = [
  { before: '/images/antes-obra-1.jpeg', after: '/images/despues-obra-1.jpeg', label: 'Reforma integral' },
  { before: '/images/antes-obra-2.jpeg', after: '/images/despues-obra-2.jpeg', label: 'Reforma visualizada' },
  { before: '/images/antes-obra-4.png', after: '/images/despues-obra-4.jpeg', label: 'Reforma visualizada' },
  { before: '/images/antes-obra-3.jpeg', after: '/images/despues-obra-3.jpeg', label: 'Transformación total' },
]

export default function BeforeAfter() {
  return (
    <section id="antes-despues" className="py-16 md:py-40 px-4 sm:px-6 bg-surface-light space-y-24 md:space-y-56">
      <div className="max-w-7xl mx-auto">

        {/* Franja 1: foto móvil → pro — side by side estático */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">Resultado real</p>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Foto de móvil → Foto profesional</h3>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Sube cualquier foto hecha con el móvil. La IA la transforma en imagen de calidad profesional en 30 segundos. Sin Photoshop. Sin fotógrafo.
            </p>
          </div>
          <div className="max-w-5xl mx-auto space-y-8">
            {fotoProPairs.map((pair, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                    <img src={pair.before} alt="Antes" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">Antes</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Foto con móvil sin editar</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }} className="relative">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-2 ring-accent/30">
                    <img src={pair.after} alt="Después" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    <span className="absolute top-3 right-3 bg-accent/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">Después</span>
                    <div className="absolute inset-0 ring-2 ring-accent/20 rounded-2xl pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Resultado IA — 30 segundos</p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="border-t border-surface-border/50 max-w-4xl mx-auto" />

        {/* Franja 2: relighting */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <RelightingStrip />
        </motion.div>

        <div className="border-t border-surface-border/50 max-w-4xl mx-auto" />

        {/* Franja 3: obras */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-16 pt-8">
            <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">Reforma virtual</p>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">De obra a listo para vender</h3>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              La IA visualiza el inmueble terminado. El comprador ve el potencial, no el estado actual.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {obraPairs.map((pair) => (
              <SliderCard key={pair.before} {...pair} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
