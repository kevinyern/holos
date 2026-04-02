'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  photo_count?: number
}

const DEMO_PHOTOS = [
  {
    originalUrl: '/images/antes-obra-1.jpeg',
    processedUrl: '/images/despues-obra-1.jpeg',
  },
  {
    originalUrl: '/images/antes-obra-2.jpeg',
    processedUrl: '/images/despues-obra-2.jpeg',
  },
  {
    originalUrl: '/images/antes-obra-3.jpeg',
    processedUrl: '/images/despues-obra-3.jpeg',
  },
]

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  processing: 'bg-amber-500/10 text-amber-400',
  archived: 'bg-gray-500/10 text-gray-400',
  demo: 'bg-blue-500/10 text-blue-400',
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  processing: 'Procesando',
  archived: 'Archivado',
  demo: 'DEMO',
}

function OnboardingOverlay({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: '📁', label: 'Crea un proyecto' },
    { icon: '📸', label: 'Sube tus fotos' },
    { icon: '⬇️', label: 'Descarga los resultados' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur p-4">
      <div className="bg-surface-card rounded-2xl p-8 max-w-md w-full shadow-2xl border border-surface-border">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-xl font-bold text-white">Bienvenido a Holos</h2>
          <p className="text-gray-400 text-sm mt-2">En 3 pasos tienes fotos profesionales</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs text-gray-300 font-medium">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <svg className="w-4 h-4 text-gray-600 shrink-0 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Empezar
        </button>
      </div>
    </div>
  )
}

const PLAN_QUOTAS: Record<string, number> = {
  free: 3,
  starter: 150,
  pro: 750,
  agency: 2000,
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Professional',
  agency: 'Agency',
}

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const onboarded = localStorage.getItem('holos_onboarded')
    if (!onboarded) setShowOnboarding(true)
  }, [])

  function closeOnboarding() {
    localStorage.setItem('holos_onboarded', 'true')
    setShowOnboarding(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function ensureDemoProject(userId: string, existingProjects: Project[]): Promise<Project[]> {
    // If user already has projects (including demo), skip creation
    if (existingProjects.length > 0) return existingProjects

    // Create demo project
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: '✨ DEMO — Ejemplos reales', user_id: userId, status: 'demo' })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating demo project:', error)
      return existingProjects
    }

    // Insert demo photos
    const photoInserts = DEMO_PHOTOS.map((p) => ({
      project_id: data.id,
      original_url: p.originalUrl,
      processed_url: p.processedUrl,
      status: 'completed',
    }))

    await supabase.from('photos').insert(photoInserts)

    return [{ ...data, photo_count: DEMO_PHOTOS.length }]
  }

  async function loadProjects() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch usage data
      const { data: userData } = await supabase
        .from('users')
        .select('photos_used, plan')
        .eq('id', user.id)
        .single()
      if (userData) {
        setUsage({
          used: userData.photos_used ?? 0,
          limit: PLAN_QUOTAS[userData.plan] ?? 3,
          plan: userData.plan ?? 'free',
        })
      }

      const { data: projectRows, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
        return
      }

      let rows = projectRows || []

      // Get photo counts for each project
      const projectsWithCounts: Project[] = await Promise.all(
        rows.map(async (p) => {
          const { count } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', p.id)
          return { ...p, photo_count: count || 0 }
        })
      )

      // Ensure demo project for new users
      const finalProjects = await ensureDemoProject(user.id, projectsWithCounts)

      // Sort: demo first, then by created_at desc
      finalProjects.sort((a, b) => {
        if (a.status === 'demo') return -1
        if (b.status === 'demo') return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setProjects(finalProjects)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!newName.trim() || creating) return
    setCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('projects')
        .insert({ name: newName.trim(), user_id: user.id, status: 'active' })
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        return
      }

      setShowModal(false)
      setNewName('')
      router.push(`/project/${data.id}`)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando tus proyectos...</p>
      </div>
    )
  }

  return (
    <div>
      {showOnboarding && <OnboardingOverlay onClose={closeOnboarding} />}

      {/* Usage bar */}
      {usage && (() => {
        const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100))
        const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
        const textColor = pct >= 100 ? 'text-red-400' : pct >= 80 ? 'text-amber-400' : 'text-gray-300'
        return (
          <div className="mb-6 bg-surface-card border border-surface-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${textColor}`}>
                  {usage.used} de {usage.limit} fotos usadas este mes
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                  {PLAN_LABELS[usage.plan] || usage.plan}
                </span>
              </div>
              <a
                href="/pricing"
                className="text-sm font-semibold text-accent hover:text-accent-light transition-colors shrink-0"
              >
                {usage.plan === 'free' ? 'Upgrade' : 'Cambiar plan'}
              </a>
            </div>
            <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct >= 100 && (
              <p className="text-xs text-red-400 font-medium mt-2">Cuota agotada — actualiza tu plan para seguir procesando fotos</p>
            )}
          </div>
        )
      })()}

      {projects.length > 0 && (
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Mis proyectos</h1>
            <p className="text-gray-400 text-sm mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent-light text-white font-medium px-4 sm:px-5 py-2.5 min-h-[48px] rounded-xl transition-colors flex items-center gap-2 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 sm:py-20">
          <div className="text-7xl sm:text-8xl mb-6 animate-bounce-slow">
            🏠
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Empieza transformando tu primera foto
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-md mx-auto">
            Es muy facil. Solo sube una foto y la IA hace el resto.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent-light hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all inline-flex items-center gap-2"
          >
            Crear mi primer proyecto
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            {[
              { step: '1', icon: '📁', title: 'Crea un proyecto', desc: 'Dale un nombre a tu propiedad' },
              { step: '2', icon: '📸', title: 'Sube tus fotos', desc: 'Arrastra o selecciona las imagenes' },
              { step: '3', icon: '✨', title: 'Descarga el resultado', desc: 'Fotos profesionales en segundos' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-surface-card border border-surface-border rounded-2xl p-6 text-center h-full">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="group bg-surface-card border border-surface-border rounded-xl p-6 hover:border-accent/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status] || statusColors.active}`}>
                  {statusLabels[project.status] || project.status}
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>{project.photo_count || 0} fotos</span>
                <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
              </div>
              {project.status === 'demo' && (
                <p className="text-xs text-blue-400/70 mt-2">Entra para ver ejemplos reales procesados con IA</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Modal nuevo proyecto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 sm:p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🏡</div>
              <h2 className="text-xl font-bold">Nuevo proyecto</h2>
              <p className="text-sm text-gray-400 mt-1">Ponle el nombre de la propiedad</p>
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              placeholder="Ej: Piso en calle Gran Via 15"
              autoFocus
              className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent transition-colors mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setNewName('') }}
                className="px-5 py-2.5 min-h-[48px] rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createProject}
                disabled={!newName.trim() || creating}
                className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium px-6 py-2.5 min-h-[48px] rounded-xl transition-colors"
              >
                {creating ? 'Creando...' : 'Crear proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
