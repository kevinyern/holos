'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

const MOCK_USER = {
  email: 'rafa@holos.app',
  plan: 'pro',
  created_at: '2026-02-15',
}

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', features: ['10 fotos/mes', '1 proyecto', 'Resolución estándar'] },
  { id: 'pro', name: 'Pro', price: '$29', features: ['200 fotos/mes', 'Proyectos ilimitados', 'Alta resolución', 'Virtual staging'] },
  { id: 'enterprise', name: 'Enterprise', price: '$99', features: ['Fotos ilimitadas', 'API access', 'Soporte prioritario', 'White label'] },
]

export default function SettingsPage() {
  const [email, setEmail] = useState(MOCK_USER.email)

  return (
    <div className="min-h-screen bg-surface">
      {/* Reuse dashboard nav */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <Link href="/dashboard">
            <Logo className="text-xl" />
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              Proyectos
            </Link>
            <Link href="/settings" className="px-4 py-2 rounded-lg text-sm bg-surface-card text-white transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Profile section */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-6">Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Miembro desde</label>
              <p className="text-white">{MOCK_USER.created_at}</p>
            </div>
            <button className="bg-accent hover:bg-accent-light text-white font-medium px-5 py-2.5 rounded-xl transition-colors">
              Guardar cambios
            </button>
          </div>
        </div>

        {/* Plan section */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-6">Tu plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-xl p-5 transition-all ${
                  MOCK_USER.plan === plan.id
                    ? 'border-accent bg-accent/5'
                    : 'border-surface-border hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {MOCK_USER.plan === plan.id && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">Actual</span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-4">
                  {plan.price}<span className="text-sm font-normal text-gray-500">/mes</span>
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {MOCK_USER.plan !== plan.id && (
                  <button className="mt-4 w-full border border-surface-border text-sm text-gray-400 hover:text-white hover:border-gray-500 py-2 rounded-xl transition-colors">
                    Cambiar plan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-surface-card border border-red-500/20 rounded-xl p-8">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Zona peligrosa</h2>
          <p className="text-sm text-gray-500 mb-4">Eliminar tu cuenta borrará todos tus proyectos y fotos permanentemente.</p>
          <button className="border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
