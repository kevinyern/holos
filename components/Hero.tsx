'use client'

import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

// ─── PARTICLES ───────────────────────────────────────────────────────────────

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 60
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${p.o})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}

// ─── ROTATING PHRASES ────────────────────────────────────────────────────────

const PHRASES = [
  { white: 'Tu foto de móvil. ', accent: 'Lista para vender.' },
  { white: 'De foto cutre ', accent: 'a imagen de agencia.' },
  { white: 'Sin fotógrafo. Sin Photoshop. ', accent: 'En 30 segundos.' },
]

function RotatingHero() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-[1.2em]">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-white">{PHRASES[index].white}</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
          {PHRASES[index].accent}
        </span>
      </motion.span>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {PHRASES.map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full bg-white/20 overflow-hidden"
            animate={{ width: i === index ? 24 : 8 }}
            transition={{ duration: 0.3 }}
          >
            {i === index && (
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── ANIMATED SLIDER ─────────────────────────────────────────────────────────

function AnimatedSlider() {
  const progress = useMotionValue(0)
  const clipPercent = useTransform(progress, [0, 1], [8, 92])

  useAnimationFrame((t) => {
    const cycle = 4000
    const loopT = (t % cycle) / cycle
    const eased = (1 - Math.cos(loopT * Math.PI * 2)) / 2
    progress.set(eased)
  })

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/despues-obra-1.jpeg" alt="Después" className="w-full h-full object-cover" loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: useTransform(clipPercent, (v) => `inset(0 ${100 - v}% 0 0)`) }}
      >
        <img src="/images/antes-obra-1.jpeg" alt="Antes" className="w-full h-full object-cover" loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>
      {/* Light line on slider edge */}
      <motion.div
        className="absolute top-0 bottom-0 w-[3px] z-20"
        style={{
          left: useTransform(clipPercent, (v) => `${v}%`),
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.9) 30%, white 50%, rgba(255,255,255,0.9) 70%, transparent)',
          boxShadow: '0 0 16px 2px rgba(255,255,255,0.7)',
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </motion.div>
      <div className="absolute top-4 left-4 z-30">
        <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">Antes</span>
      </div>
      <div className="absolute top-4 right-4 z-30">
        <span className="bg-accent/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">Después</span>
      </div>
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-28 px-4 sm:px-6 overflow-hidden">
      <FloatingParticles />

      {/* Dual blobs — más dramáticos */}
      <div className="absolute top-[-80px] left-[-120px] w-[700px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-100px] w-[600px] h-[500px] bg-purple-700/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Copy centrado */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-surface-card border border-surface-border rounded-full px-4 py-1.5 text-sm text-gray-400 mb-7">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Resultado en 30 segundos · <span className="text-white font-semibold">Sin fotógrafo</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5"
          >
            <RotatingHero />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-gray-400 text-base md:text-xl max-w-xl mx-auto mb-9 leading-relaxed px-2"
          >
            Sube cualquier foto de móvil y obtén una imagen de agencia en 30 segundos. Vende antes. Cobra más. Sin fotógrafo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-col sm:flex-row gap-4 justify-center px-2"
          >
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
            >
              Pruébalo gratis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
            <motion.a
              href="#antes-despues"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto border border-surface-border hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl text-base sm:text-lg transition-all flex items-center justify-center"
            >
              Ver resultados
            </motion.a>
          </motion.div>
        </div>

        {/* Slider animado */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative"
        >
          <div className="aspect-[4/3] sm:aspect-[16/9] max-w-4xl mx-auto rounded-2xl border border-white/10 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            <AnimatedSlider />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-accent/15 blur-3xl rounded-full" />
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Únete a los primeros agentes</p>
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Sin tarjeta
            <span className="mx-3 text-gray-700">·</span>
            Sin compromiso
            <span className="mx-3 text-gray-700">·</span>
            Resultado en 30 segundos
          </p>
        </motion.div>

      </div>
    </section>
  )
}
