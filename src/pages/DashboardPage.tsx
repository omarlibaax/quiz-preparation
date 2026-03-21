import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyDashboard } from '../services/studentsApi'
import type { ApiStudentDashboard } from '../types/api'

export default function DashboardPage() {
  const { tokens } = useAuth()
  const [data, setData] = useState<ApiStudentDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!tokens?.accessToken) return
      try {
        const dashboard = await getMyDashboard(tokens.accessToken)
        if (!cancelled) setData(dashboard)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tokens?.accessToken])

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-8 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Overview</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your dashboard</h1>
            <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">Performance snapshot — no single boxed card; sections breathe across the layout.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              ← Home
            </Link>
            <Link
              to="/attempts"
              className="rounded-2xl bg-gradient-to-r from-[#845adf] to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
            >
              All attempts
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800" />
            ))}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {!loading && !error && data ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#845adf]/15 blur-2xl" />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total attempts</p>
                <p className="mt-3 text-4xl font-black tabular-nums text-slate-900 dark:text-white">{data.totalAttempts}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Lifetime quiz runs</p>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Average score</p>
                <p className="mt-3 text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">{data.averageScore}%</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Across all attempts</p>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-card dark:from-slate-800 dark:to-slate-900 md:col-span-2 xl:col-span-1">
                <p className="text-xs font-bold uppercase tracking-wide text-white/70">Next step</p>
                <p className="mt-3 text-lg font-bold">Keep your streak</p>
                <p className="mt-2 text-sm text-white/80">Review weak topics below, then start a new timed quiz.</p>
                <Link
                  to="/setup"
                  className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-900"
                >
                  New quiz
                </Link>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weak topics</h2>
                <div className="mt-4 space-y-3">
                  {data.weakTopics.length === 0 ? (
                    <p className="text-sm text-slate-500">No weak-topic data yet — take a few quizzes first.</p>
                  ) : (
                    data.weakTopics.map((topic) => (
                      <div
                        key={topic.topicId}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{topic.topicName}</span>
                        <span className="text-sm font-black tabular-nums text-[#845adf]">{topic.accuracyPercent}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent attempts</h2>
                  <Link to="/attempts" className="text-sm font-bold text-[#845adf] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {data.recentAttempts.length === 0 ? (
                    <p className="text-sm text-slate-500">No attempts yet.</p>
                  ) : (
                    data.recentAttempts.map((attempt) => (
                      <div
                        key={attempt.attemptId}
                        className="rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="font-bold text-slate-900 dark:text-white">{attempt.examTitle}</div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {attempt.subjectName} • {attempt.scorePercent}% • C:{attempt.correctCount} W:{attempt.wrongCount} S:
                          {attempt.skippedCount}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
