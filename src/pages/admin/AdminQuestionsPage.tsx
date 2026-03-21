import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { listQuestions } from '../../services/questionsApi'
import { fetchSubjects } from '../../services/subjectsApi'
import type { ApiQuestionListItem } from '../../types/api'
import { EmptyState } from '../../components/admin/EmptyState'
import { Skeleton } from '../../components/admin/Skeleton'

export default function AdminQuestionsPage() {
  const [rows, setRows] = useState<ApiQuestionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [topicId, setTopicId] = useState<number | ''>('')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('')
  const [type, setType] = useState<'MCQ' | 'TF' | ''>('')

  async function load() {
    setLoading(true)
    try {
      const list = await listQuestions({
        topicId: topicId === '' ? undefined : Number(topicId),
        difficulty: difficulty || undefined,
        type: type || undefined,
        limit: 100,
      })
      setRows(list)
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [topicId, difficulty, type])

  const [subjects, setSubjects] = useState<Awaited<ReturnType<typeof fetchSubjects>>>([])
  useEffect(() => {
    void fetchSubjects().then(setSubjects).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Question bank</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse API questions. Create/import via Operations.</p>
        </div>
        <Link
          to="/admin/operations"
          className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
        >
          Add / import questions
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={topicId === '' ? '' : String(topicId)}
          onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All topics</option>
          {subjects.flatMap((s) =>
            s.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {s.name} — {t.name}
              </option>
            )),
          )}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Any difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Any type</option>
          <option value="MCQ">MCQ</option>
          <option value="TF">True/False</option>
        </select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState title="No questions match" description="Adjust filters or add content in Operations." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50/95 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/95 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr key={q.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{q.id}</td>
                    <td className="max-w-md px-4 py-2.5 text-slate-800 dark:text-slate-200">{q.questionText}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{q.topic.subject.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{q.topic.name}</td>
                    <td className="px-4 py-2.5">{q.type}</td>
                    <td className="px-4 py-2.5">{q.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
