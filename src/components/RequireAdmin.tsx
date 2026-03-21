import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100/70">
          Checking admin access...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

