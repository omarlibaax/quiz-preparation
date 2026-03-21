import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bootstrapAdmin } from '../services/bootstrapApi'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBootstrap, setShowBootstrap] = useState(false)
  const [bootstrapFullName, setBootstrapFullName] = useState('')
  const [bootstrapEmail, setBootstrapEmail] = useState('')
  const [bootstrapPassword, setBootstrapPassword] = useState('')
  const [bootstrapSecret, setBootstrapSecret] = useState('')
  const [bootstrapSubmitting, setBootstrapSubmitting] = useState(false)
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const query = useQuery()
  const returnTo = query.get('returnTo') || '/'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      if (mode === 'register') {
        await register({ fullName, email, password })
      } else {
        await login({ email, password })
      }
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onBootstrapSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBootstrapSubmitting(true)
    setBootstrapMessage(null)
    setError(null)
    try {
      await bootstrapAdmin({
        fullName: bootstrapFullName.trim(),
        email: bootstrapEmail.trim(),
        password: bootstrapPassword,
        bootstrapSecret,
      })
      setBootstrapMessage('Admin account created. You can log in with that email and password.')
      setMode('login')
      setEmail(bootstrapEmail.trim())
      setPassword('')
      setShowBootstrap(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bootstrap failed')
    } finally {
      setBootstrapSubmitting(false)
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-slate-500 transition hover:text-slate-800">
          ← Back
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Account</div>
        <div className="w-10" />
      </header>

      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white/90 shadow-sm ring-1 ring-slate-200/80">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-6 py-6 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-90">QuizTime</p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">
            {mode === 'login' ? 'Welcome back' : 'Create student account'}
          </h1>
          <p className="mt-1 text-[11px] text-sky-100">Login to track progress and use full exam features.</p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
              ].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
              ].join(' ')}
            >
              Register
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === 'register' ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none ring-indigo-500 transition focus:ring-2"
              />
            ) : null}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none ring-indigo-500 transition focus:ring-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={mode === 'register' ? 8 : 1}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none ring-indigo-500 transition focus:ring-2"
            />

            {error ? <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</div> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          {bootstrapMessage ? (
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{bootstrapMessage}</div>
          ) : null}

          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowBootstrap((v) => !v)
                setError(null)
              }}
              className="text-left text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {showBootstrap ? 'Hide' : 'First-time setup: create admin account'}
            </button>
            {showBootstrap ? (
              <form onSubmit={onBootstrapSubmit} className="mt-3 space-y-2">
                <p className="text-[11px] text-slate-500">
                  Use only when no admin exists yet. Secret must match <code className="rounded bg-slate-100 px-1">ADMIN_BOOTSTRAP_SECRET</code> on the server.
                </p>
                <input
                  type="text"
                  value={bootstrapFullName}
                  onChange={(e) => setBootstrapFullName(e.target.value)}
                  placeholder="Full name"
                  required
                  minLength={2}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                />
                <input
                  type="email"
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                  placeholder="Admin email"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                />
                <input
                  type="password"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  placeholder="Admin password (min 8)"
                  required
                  minLength={8}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                />
                <input
                  type="password"
                  value={bootstrapSecret}
                  onChange={(e) => setBootstrapSecret(e.target.value)}
                  placeholder="Bootstrap secret"
                  required
                  minLength={8}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={bootstrapSubmitting}
                  className="w-full rounded-2xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {bootstrapSubmitting ? 'Creating…' : 'Create admin'}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

