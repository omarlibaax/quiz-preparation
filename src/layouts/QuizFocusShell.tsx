import { Link, Outlet, useLocation } from 'react-router-dom'

/**
 * Minimal chrome for quiz flow — no main marketing footer, focused session UI.
 */
export default function QuizFocusShell() {
  const { pathname } = useLocation()
  const isQuiz = pathname === '/quiz'

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fb] dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#845adf] to-indigo-600 text-sm font-black text-white shadow-md shadow-indigo-500/20">
              Q
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">QuizTime</span>
          </Link>
          <div className="flex items-center gap-2">
            {isQuiz ? (
              <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-200 sm:inline">
                Focus mode
              </span>
            ) : null}
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="relative flex-1">
        <QuizMesh />
        <Outlet />
      </main>
    </div>
  )
}

function QuizMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#845adf]/10 blur-3xl dark:bg-[#845adf]/15" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
    </div>
  )
}
