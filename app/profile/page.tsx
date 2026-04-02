'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/Logo'

interface UserProfile {
  email: string
  plan: string
  created_at: string
}

interface Project {
  id: string
  name: string
  status: string
  created_at: string
}

const planBadge: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  pro: { label: 'Pro', color: 'bg-accent/10 text-accent border-accent/20' },
  enterprise: { label: 'Enterprise', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  processing: 'bg-amber-500/10 text-amber-400',
  archived: 'bg-gray-500/10 text-gray-400',
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  processing: 'Procesando',
  archived: 'Archivado',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({
        email: user.email || userData?.email || '',
        plan: userData?.plan || 'free',
        created_at: userData?.created_at || user.created_at || '',
      })

      const { data: projectRows } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProjects(projectRows || [])
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  function getInitials(email: string) {
    return email.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const badge = planBadge[profile.plan] || planBadge.free

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-8">
          <Link href="/dashboard">
            <Logo className="text-xl" />
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="px-3 sm:px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              Proyectos
            </Link>
            <Link href="/profile" className="px-3 sm:px-4 py-2 rounded-lg text-sm bg-surface-card text-white transition-colors">
              Perfil
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Avatar + info */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-accent">{getInitials(profile.email)}</span>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{profile.email}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-sm text-gray-500">
                  Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Proyectos */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Mis proyectos</h2>
            <span className="text-sm text-gray-500">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</span>
          </div>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No tienes proyectos aún.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="flex items-center justify-between bg-surface-light border border-surface-border rounded-xl px-4 sm:px-5 py-4 hover:border-accent/40 transition-all min-h-[48px]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(project.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${statusColors[project.status] || statusColors.active}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pricing"
            className="flex-1 text-center bg-accent hover:bg-accent-light text-white font-medium py-3 min-h-[48px] flex items-center justify-center rounded-xl transition-colors"
          >
            Ver planes
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 text-center border border-surface-border hover:border-red-500/40 text-gray-400 hover:text-red-400 font-medium py-3 min-h-[48px] rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
