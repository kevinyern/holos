'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOCK_PROJECTS = [
  { id: '1', name: 'Casa Polanco 42', status: 'active', photos: 24, created_at: '2026-03-28' },
  { id: '2', name: 'Depto Roma Norte', status: 'processing', photos: 12, created_at: '2026-03-25' },
  { id: '3', name: 'Oficina Reforma 200', status: 'active', photos: 8, created_at: '2026-03-20' },
  { id: '4', name: 'Penthouse Santa Fe', status: 'active', photos: 36, created_at: '2026-03-15' },
]

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mis proyectos</h1>
          <p className="text-gray-400 text-sm mt-1">{MOCK_PROJECTS.length} proyectos</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PROJECTS.map((project) => (
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
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{project.photos} fotos</span>
              <span>{project.created_at}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal nuevo proyecto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-surface-border rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo proyecto</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
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
                onClick={() => { setShowModal(false); setNewName('') }}
                className="bg-accent hover:bg-accent-light text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                Crear proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
