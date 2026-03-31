'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const supabase = createClient()

  useEffect(() => {
    // Supabase manda el token como hash fragment
    // El SDK lo procesa automáticamente con detectSessionInUrl
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.replace('/dashboard')
      }
      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        window.location.replace('/auth')
      }
    })

    // También comprueba si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Iniciando sesión...</p>
    </div>
  )
}
