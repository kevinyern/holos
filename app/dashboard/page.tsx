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

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: projectRows, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
        return
      }

      // Get photo counts for each project
      const projectsWithCounts: Project[] = await Promise.all(
        (projectRows || []).map(async (p) => {
          const { count } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', p.id)
          return { ...p, photo_count: count || 0 }
        })
      )

      setProjects(projectsWithCounts)
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
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mis proyectos</h1>
          <p className="text-gray-400 text-sm mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accent-light text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No tienes proyectos aún</h2>
          <p className="text-gray-500 text-sm mb-6">Crea tu primer proyecto para empezar a mejorar tus fotos inmobiliarias</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent-light text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Crear primer proyecto
          </button>
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
            </Link>
          ))}
        </div>
      )}

      {/* Modal nuevo proyecto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-surface-border rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo proyecto</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              placeholder="Nombre del proyecto"
              autoFocus
              className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent transition-colors mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setNewName('') }}
                className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createProject}
                disabled={!newName.trim() || creating}
                className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
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
