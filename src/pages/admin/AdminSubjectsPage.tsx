import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createSubject, createTopic } from '../../services/adminApi'
import { fetchSubjects } from '../../services/subjectsApi'
import type { ApiSubject } from '../../types/api'

/**
 * Create and review subjects & topics (structure of the question catalog).
 */
export default function AdminSubjectsPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [topicName, setTopicName] = useState('')
  const [topicSubjectId, setTopicSubjectId] = useState<number | ''>('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadAll() {
    const s = await fetchSubjects()
    setSubjects(s)
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function onCreateSubject() {
    if (!tokens?.accessToken || !subjectName.trim()) return
    try {
      await createSubject(subjectName.trim(), tokens.accessToken)
      setSubjectName('')
      setStatus('Subject created')
      setError(null)
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create subject')
    }
  }

  async function onCreateTopic() {
    if (!tokens?.accessToken || !topicName.trim() || !topicSubjectId) return
    try {
      await createTopic(Number(topicSubjectId), topicName.trim(), tokens.accessToken)
      setTopicName('')
      setStatus('Topic created')
      setError(null)
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create topic')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Subjects & topics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize your catalog. Questions belong to topics; topics belong to subjects.
          </p>
        </div>
        <Link
          to="/admin/questions"
          className="shrink-0 text-sm font-semibold text-[#845adf] hover:underline dark:text-[#c4b5fd]"
        >
          Open question bank →
        </Link>
      </div>

      {status ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {status}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Create subject</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Top-level category (e.g. Mathematics, Science).</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Computer Science"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={onCreateSubject}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Add subject
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Create topic</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sub-category under a subject (e.g. Algebra).</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <select
              value={topicSubjectId}
              onChange={(e) => setTopicSubjectId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white sm:col-span-2"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Data Structures"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white sm:col-span-2"
            />
            <button
              type="button"
              onClick={onCreateTopic}
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 sm:col-span-2"
            >
              Add topic
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Catalog overview</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subjects.length === 0
            ? 'No subjects yet — create one above or run an import from Import data.'
            : `${subjects.length} subject(s) loaded.`}
        </p>
        {subjects.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {subjects.map((s) => (
              <li key={s.id} className="py-3 first:pt-0">
                <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {s.topics.length === 0 ? (
                    <span className="text-xs text-slate-500">No topics yet</span>
                  ) : (
                    s.topics.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {t.name}
                      </span>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
