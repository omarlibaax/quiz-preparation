import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useThemeStore } from '../store/themeStore'
import { cn } from '../utils/cn'
import { isAdminPanelRole } from '../utils/roles'

/** Full-width student / public app — no single “card box”; content uses the full viewport. */
export default function MainShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#845adf] via-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill="none">
                <path
                  d="M9.1 9a3 3 0 1 1 4.8 2.4c-.9.7-1.4 1.2-1.4 2.6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17.5" r="1" fill="currentColor" />
                <path
                  d="M4.5 12a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                QuizTime
              </div>
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Learn & practice</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )
              }
              end
            >
              Home
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    )
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/attempts"
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    )
                  }
                >
                  Attempts
                </NavLink>
                {isAdminPanelRole(user?.role) ? (
                  <Link
                    to="/admin/dashboard"
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#845adf] hover:bg-[#845adf]/10 dark:text-[#c4b5fd]"
                  >
                    Admin
                  </Link>
                ) : null}
              </>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {/* Mobile quick links — desktop uses the nav above */}
            <div className="flex max-w-[45vw] gap-1 overflow-x-auto md:hidden">
              <Link
                to="/"
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    Dash
                  </Link>
                  <Link to="/attempts" className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    Attempts
                  </Link>
                </>
              ) : null}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            {isAuthenticated ? (
              <>
                <span className="hidden max-w-[140px] truncate text-xs font-semibold text-slate-500 dark:text-slate-400 lg:inline">
                  {user?.fullName}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-xl bg-gradient-to-r from-[#845adf] to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        {/* Soft mesh background — full bleed, not a box */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-90 dark:opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(132, 90, 223, 0.18), transparent),
              radial-gradient(ellipse 60% 40% at 100% 0%, rgba(56, 189, 248, 0.12), transparent),
              radial-gradient(ellipse 50% 30% at 0% 100%, rgba(16, 185, 129, 0.1), transparent)
            `,
          }}
        />
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 py-8 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} QuizTime — practice smarter.</p>
          <div className="flex gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link to="/auth" className="hover:text-[#845adf]">
              Account
            </Link>
            <a href="#" className="hover:text-[#845adf]" onClick={(e) => e.preventDefault()}>
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function IconSun() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}
function IconMoon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}
