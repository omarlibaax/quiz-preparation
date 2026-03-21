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
    <div className="flex-1 p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-slate-500 transition hover:text-slate-800">
          ← Back
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Dashboard</div>
        <div className="w-10" />
      </header>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        {loading ? <div className="text-sm text-slate-600">Loading dashboard...</div> : null}
        {error ? <div className="text-sm font-semibold text-rose-600">{error}</div> : null}
        {!loading && !error && data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                <div className="text-xs font-semibold text-indigo-700">Total Attempts</div>
                <div className="mt-1 text-2xl font-extrabold text-indigo-900">{data.totalAttempts}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <div className="text-xs font-semibold text-emerald-700">Average Score</div>
                <div className="mt-1 text-2xl font-extrabold text-emerald-900">{data.averageScore}%</div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">Weak Topics</h2>
              <div className="mt-2 space-y-2">
                {data.weakTopics.length === 0 ? (
                  <div className="text-sm text-slate-500">No weak-topic data yet.</div>
                ) : (
                  data.weakTopics.map((topic) => (
                    <div key={topic.topicId} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-800">{topic.topicName}</div>
                        <div className="text-xs font-bold text-slate-700">{topic.accuracyPercent}%</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Attempts</h2>
              <div className="mt-2 space-y-2">
                {data.recentAttempts.length === 0 ? (
                  <div className="text-sm text-slate-500">No attempts yet.</div>
                ) : (
                  data.recentAttempts.map((attempt) => (
                    <div key={attempt.attemptId} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="text-sm font-bold text-slate-900">{attempt.examTitle}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {attempt.subjectName} • {attempt.scorePercent}% • C:{attempt.correctCount} W:{attempt.wrongCount} S:{attempt.skippedCount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

