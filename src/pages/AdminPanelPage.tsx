import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSubject, createTopic } from '../services/adminApi'
import { listAllExams, setExamPublished } from '../services/examsApi'
import { fetchSubjects } from '../services/subjectsApi'
import type { ApiExam, ApiSubject } from '../types/api'

export default function AdminPanelPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [exams, setExams] = useState<ApiExam[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [topicName, setTopicName] = useState('')
  const [topicSubjectId, setTopicSubjectId] = useState<number | ''>('')
  const [status, setStatus] = useState<string | null>(null)

  async function loadAll() {
    const [s, e] = await Promise.all([fetchSubjects(), listAllExams()])
    setSubjects(s)
    setExams(e)
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function onCreateSubject() {
    if (!tokens?.accessToken || !subjectName.trim()) return
    await createSubject(subjectName.trim(), tokens.accessToken)
    setSubjectName('')
    setStatus('Subject created')
    await loadAll()
  }

  async function onCreateTopic() {
    if (!tokens?.accessToken || !topicName.trim() || !topicSubjectId) return
    await createTopic(Number(topicSubjectId), topicName.trim(), tokens.accessToken)
    setTopicName('')
    setStatus('Topic created')
    await loadAll()
  }

  async function onTogglePublish(exam: ApiExam) {
    if (!tokens?.accessToken) return
    await setExamPublished(exam.id, !exam.isPublished, tokens.accessToken)
    setStatus(`Exam ${!exam.isPublished ? 'published' : 'unpublished'}`)
    await loadAll()
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-slate-500 transition hover:text-slate-800">
          ← Back
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin Panel</div>
        <div className="w-10" />
      </header>

      <div className="space-y-4">
        {status ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{status}</div> : null}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900">Create Subject</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Computer Science"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button onClick={onCreateSubject} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
              Add
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900">Create Topic</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select
              value={topicSubjectId}
              onChange={(e) => setTopicSubjectId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button onClick={onCreateTopic} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white">
              Add Topic
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900">Manage Exams</h2>
          <div className="mt-3 space-y-2">
            {exams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">{exam.title}</div>
                  <div className="text-xs text-slate-500">{exam.subject.name}</div>
                </div>
                <button
                  onClick={() => onTogglePublish(exam)}
                  className={[
                    'rounded-xl px-3 py-2 text-xs font-bold',
                    exam.isPublished ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
                  ].join(' ')}
                >
                  {exam.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            ))}
            {exams.length === 0 ? <div className="text-sm text-slate-500">No exams found.</div> : null}
          </div>
        </section>
      </div>
    </div>
  )
}

