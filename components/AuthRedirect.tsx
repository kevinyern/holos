'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthRedirect() {
  useEffect(() => {
    const supabase = createClient()

    // Comprueba sesión al montar — cubre el caso de sesión ya activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/dashboard'
      }
    })

    // Escucha eventos de auth — cubre el OAuth callback que procesa el hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        window.location.href = '/dashboard'
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
