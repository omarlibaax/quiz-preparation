import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { bootstrapAdmin } from '../services/bootstrapApi'
import { AuthDecorBackground } from '../components/auth/AuthDecorBackground'

const REMEMBER_KEY = 'quiztime_remember'
const EMAIL_KEY = 'quiztime_saved_email'

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
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBootstrap, setShowBootstrap] = useState(false)
  const [bootstrapFullName, setBootstrapFullName] = useState('')
  const [bootstrapEmail, setBootstrapEmail] = useState('')
  const [bootstrapPassword, setBootstrapPassword] = useState('')
  const [bootstrapSecret, setBootstrapSecret] = useState('')
  const [bootstrapSubmitting, setBootstrapSubmitting] = useState(false)
  const navigate = useNavigate()
  const query = useQuery()
  const returnTo = query.get('returnTo') || '/'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY) === '1'
      const em = localStorage.getItem(EMAIL_KEY)
      if (saved && em) {
        setRememberMe(true)
        setEmail(em)
      }
    } catch {
      /* ignore */
    }
  }, [])

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
      try {
        if (rememberMe && mode === 'login') {
          localStorage.setItem(REMEMBER_KEY, '1')
          localStorage.setItem(EMAIL_KEY, email.trim())
        } else {
          localStorage.removeItem(REMEMBER_KEY)
          localStorage.removeItem(EMAIL_KEY)
        }
      } catch {
        /* ignore */
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
    setError(null)
    try {
      await bootstrapAdmin({
        fullName: bootstrapFullName.trim(),
        email: bootstrapEmail.trim(),
        password: bootstrapPassword,
        bootstrapSecret,
      })
      await login({ email: bootstrapEmail.trim(), password: bootstrapPassword })
      setShowBootstrap(false)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bootstrap failed')
    } finally {
      setBootstrapSubmitting(false)
    }
  }

  const brand = (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#845adf] to-indigo-600 text-lg font-black text-white shadow-lg shadow-[#845adf]/30">
          Q
        </span>
        <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">QuizTime</span>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen">
      <AuthDecorBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[440px] rounded-xl border border-slate-200/90 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
          {brand}

          <div className="mt-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {mode === 'login' ? (
                <>
                  Welcome to QuizTime! <span aria-hidden>👋</span>
                </>
              ) : (
                'Create your account'
              )}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login'
                ? 'Please sign-in to your account and start the adventure'
                : 'Fill in your details to join and track your progress.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              className={[
                'rounded-lg py-2.5 text-sm font-bold transition',
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500',
              ].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError(null)
              }}
              className={[
                'rounded-lg py-2.5 text-sm font-bold transition',
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500',
              ].join(' ')}
            >
              Register
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === 'register' ? (
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-[#845adf]/0 transition placeholder:text-slate-400 focus:border-[#845adf] focus:ring-4 focus:ring-[#845adf]/15 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email or Username
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@email.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#845adf] focus:ring-4 focus:ring-[#845adf]/15 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="········"
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#845adf] focus:ring-4 focus:ring-[#845adf]/15 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {mode === 'login' ? (
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#845adf] focus:ring-[#845adf]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast('Contact your administrator to reset your password.', { icon: 'ℹ️' })}
                  className="text-sm font-semibold text-[#845adf] hover:underline dark:text-[#c4b5fd]"
                >
                  Forgot Password?
                </button>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#845adf] py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#845adf]/25 transition hover:bg-[#7360d5] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#9574e8]"
            >
              {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                New on our platform?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError(null)
                  }}
                  className="font-semibold text-[#845adf] hover:underline dark:text-[#c4b5fd]"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                  }}
                  className="font-semibold text-[#845adf] hover:underline dark:text-[#c4b5fd]"
                >
                  Sign in instead
                </button>
              </>
            )}
          </p>

          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setShowBootstrap((v) => !v)
                setError(null)
              }}
              className="text-left text-xs font-semibold text-slate-500 hover:text-[#845adf] dark:text-slate-400"
            >
              {showBootstrap ? 'Hide first-time admin setup' : 'First-time setup: create admin account'}
            </button>
            {showBootstrap ? (
              <form onSubmit={onBootstrapSubmit} className="mt-4 space-y-3">
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Use only when no admin exists. Secret must match <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">ADMIN_BOOTSTRAP_SECRET</code> on the server.
                </p>
                <input
                  type="text"
                  value={bootstrapFullName}
                  onChange={(e) => setBootstrapFullName(e.target.value)}
                  placeholder="Full name"
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <input
                  type="email"
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                  placeholder="Admin email"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <input
                  type="password"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  placeholder="Admin password (min 8)"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <input
                  type="password"
                  value={bootstrapSecret}
                  onChange={(e) => setBootstrapSecret(e.target.value)}
                  placeholder="Bootstrap secret"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  disabled={bootstrapSubmitting}
                  className="w-full rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {bootstrapSubmitting ? 'Creating…' : 'Create admin'}
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <Link
          to="/"
          className="relative z-10 mt-8 text-sm font-semibold text-slate-500 transition hover:text-[#845adf] dark:text-slate-400"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

function IconEye() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 0 0 .639c.073.18.15.352.23.519.396.773 1.05 1.716 1.95 2.654 1.94 1.99 4.46 3.32 7.784 3.32s5.844-1.33 7.784-3.32c.9-.938 1.554-1.881 1.95-2.654.08-.167.157-.339.23-.519a1.012 1.012 0 0 0 0-.639c-.073-.18-.15-.352-.23-.519-.396-.773-1.05-1.716-1.95-2.654-1.94-1.99-4.46-3.32-7.784-3.32s-5.844 1.33-7.784 3.32c-.9.938-1.554 1.881-1.95 2.654-.08.167-.157.339-.23.519Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.274M6.228 6.228 3 3m13.773 13.773L21 21m-4.293-4.293A10.45 10.45 0 0 1 12 19.5c-4.756 0-8.773-3.162-10.065-7.498M6.228 6.228 12 12m4.293 4.293L12 12" />
    </svg>
  )
}
