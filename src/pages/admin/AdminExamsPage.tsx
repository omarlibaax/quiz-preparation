import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listAllExams, setExamPublished } from '../../services/examsApi'
import type { ApiExam } from '../../types/api'
import { EmptyState } from '../../components/admin/EmptyState'
import { Skeleton } from '../../components/admin/Skeleton'

export default function AdminExamsPage() {
  const { tokens } = useAuth()
  const [exams, setExams] = useState<ApiExam[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!tokens?.accessToken) return
    try {
      const list = await listAllExams()
      setExams(list)
    } catch {
      toast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [tokens?.accessToken])

  async function togglePublish(exam: ApiExam) {
    if (!tokens?.accessToken) return
    try {
      await setExamPublished(exam.id, !exam.isPublished, tokens.accessToken)
      toast.success(exam.isPublished ? 'Unpublished' : 'Published')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Exam management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Publish exams for students. Create and configure exams in <strong>Create exam</strong>.
          </p>
        </div>
        <Link
          to="/admin/exams/builder"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Open exam builder
        </Link>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Create an exam in Create exam, or import a question bank from Import data first."
          action={
            <Link to="/admin/exams/builder" className="text-sm font-semibold text-indigo-600 hover:underline">
              Go to exam builder →
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Questions</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{e.subject.name}</td>
                  <td className="px-4 py-3 tabular-nums">{e.totalQuestions}</td>
                  <td className="px-4 py-3 tabular-nums">{e.durationMinutes} min</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        e.isPublished
                          ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }
                    >
                      {e.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => togglePublish(e)}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {e.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
