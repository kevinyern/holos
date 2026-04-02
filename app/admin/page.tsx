'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 150,
  pro: 750,
  agency: 2000,
}

const PLANS = ['free', 'starter', 'pro', 'agency'] as const

interface UserRow {
  id: string
  email: string
  plan: string
  photos_used: number
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccessAndLoad()
  }, [])

  async function checkAccessAndLoad() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email?.startsWith('kevinyern@')) {
      router.replace('/dashboard')
      return
    }
    await loadUsers()
  }

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, plan, photos_used, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading users:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  async function changePlan(userId: string, newPlan: string) {
    setUpdating(userId)
    const { error } = await supabase
      .from('users')
      .update({ plan: newPlan })
      .eq('id', userId)

    if (error) {
      console.error('Error updating plan:', error)
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
      )
    }
    setUpdating(null)
  }

  async function resetUsage(userId: string) {
    setUpdating(userId)
    const { error } = await supabase
      .from('users')
      .update({ photos_used: 0 })
      .eq('id', userId)

    if (error) {
      console.error('Error resetting usage:', error)
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, photos_used: 0 } : u))
      )
    }
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            Volver al dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Usuarios ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="pb-3 pr-4 text-gray-400 font-medium">Email</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Plan</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Uso</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Registro</th>
                <th className="pb-3 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const limit = PLAN_LIMITS[user.plan] ?? 10
                const pct = limit > 0 ? (user.photos_used / limit) * 100 : 0
                return (
                  <tr key={user.id} className="border-b border-surface-border/50 hover:bg-surface-card/50 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-white font-medium">{user.email}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={user.plan}
                        onChange={(e) => changePlan(user.id, e.target.value)}
                        disabled={updating === user.id}
                        className="bg-surface-light border border-surface-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-accent disabled:opacity-50"
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-light rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-300 whitespace-nowrap">
                          {user.photos_used}/{limit}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => resetUsage(user.id)}
                        disabled={updating === user.id}
                        className="text-xs bg-surface-light hover:bg-surface-border text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reset uso
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
