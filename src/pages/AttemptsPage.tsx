import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyAttempts } from '../services/studentsApi'
import type { ApiStudentAttempt } from '../types/api'

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function AttemptsPage() {
  const { tokens } = useAuth()
  const [attempts, setAttempts] = useState<ApiStudentAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!tokens?.accessToken) return
      try {
        const list = await getMyAttempts(tokens.accessToken, 100)
        if (!cancelled) setAttempts(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load attempts')
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
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">My attempts</div>
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          Dashboard
        </Link>
      </header>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <h1 className="text-lg font-extrabold text-slate-900">Attempt history</h1>
        <p className="mt-1 text-xs text-slate-500">Submitted exams (newest first).</p>

        {loading ? <div className="mt-4 text-sm text-slate-600">Loading…</div> : null}
        {error ? <div className="mt-4 text-sm font-semibold text-rose-600">{error}</div> : null}

        {!loading && !error && attempts.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No submitted attempts yet.</div>
        ) : null}

        {!loading && !error && attempts.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Exam</th>
                  <th className="py-2 pr-3">Subject</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">C / W / S</th>
                  <th className="py-2 pr-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.attemptId} className="border-b border-slate-100 text-slate-800">
                    <td className="py-3 pr-3 font-semibold">{a.examTitle}</td>
                    <td className="py-3 pr-3 text-slate-600">{a.subjectName}</td>
                    <td className="py-3 pr-3 font-bold text-indigo-700">{a.scorePercent}%</td>
                    <td className="py-3 pr-3 text-xs text-slate-600">
                      {a.correctCount} / {a.wrongCount} / {a.skippedCount}
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-500">{formatWhen(a.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
