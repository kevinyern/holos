'use client'

import { useEffect, useState } from 'react'

export default function ExitIntent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const shown = parseInt(localStorage.getItem('exit_intent_count') || '0', 10)
    if (shown >= 1) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setVisible(true)
        localStorage.setItem('exit_intent_count', String(shown + 1))
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/70 backdrop-blur"
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false) }}
    >
      <div className="relative bg-surface-card border border-surface-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-white mb-3">
          ¿Te vas sin probarlo?
        </h2>
        <p className="text-gray-400 mb-8">
          Sube una foto y comprueba la diferencia en 30 segundos.
        </p>
        <a
          href="/auth"
          className="block w-full bg-accent hover:bg-accent-light text-white font-semibold py-4 rounded-xl text-base transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]"
        >
          Probar ahora
        </a>
        <button
          onClick={() => setVisible(false)}
          className="mt-4 text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          No, gracias
        </button>
      </div>
    </div>
  )
}
