'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/dashboard'
      } else {
        // Espera un momento y reintenta — el token OAuth puede tardar
        setTimeout(async () => {
          const { data: { session: session2 } } = await supabase.auth.getSession()
          if (session2) {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/auth'
          }
        }, 2000)
      }
    }
    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Iniciando sesión...</p>
    </div>
  )
}
