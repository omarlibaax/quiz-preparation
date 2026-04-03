import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { createSubject, createTopic } from '../../../services/adminApi'
import { fetchSubjects } from '../../../services/subjectsApi'
import type { ApiSubject } from '../../../types/api'

export default function AdminOperationsSubjectsPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [topicSubjectId, setTopicSubjectId] = useState<number | ''>('')
  const [topicName, setTopicName] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const data = await fetchSubjects()
    setSubjects(data)
    if (!topicSubjectId && data.length > 0) setTopicSubjectId(data[0].id)
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreateSubject() {
    if (!tokens?.accessToken || !subjectName.trim()) return
    try {
      await createSubject(subjectName.trim(), tokens.accessToken)
      setSubjectName('')
      setStatus('Subject created')
      setError(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create subject')
    }
  }

  async function onCreateTopic() {
    if (!tokens?.accessToken || !topicSubjectId || !topicName.trim()) return
    try {
      await createTopic(Number(topicSubjectId), topicName.trim(), tokens.accessToken)
      setTopicName('')
      setStatus('Topic created')
      setError(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create topic')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Subjects & topics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage the learning catalog structure.</p>
      </div>
      {status ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}
      {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/80">
          <h2 className="text-sm font-bold">Create subject</h2>
          <div className="flex gap-2">
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Computer Science"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button onClick={onCreateSubject} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </div>
        </section>
        <section className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/80">
          <h2 className="text-sm font-bold">Create topic</h2>
          <select
            value={topicSubjectId}
            onChange={(e) => setTopicSubjectId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Data Structures"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button onClick={onCreateTopic} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
