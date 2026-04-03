import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { createExam, listAllExams, setExamPublished } from '../../../services/examsApi'
import { listQuestions } from '../../../services/questionsApi'
import { fetchSubjects } from '../../../services/subjectsApi'
import type { ApiExam, ApiQuestionListItem, ApiSubject } from '../../../types/api'

export default function AdminOperationsExamsPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [exams, setExams] = useState<ApiExam[]>([])
  const [examTitle, setExamTitle] = useState('')
  const [examSubjectId, setExamSubjectId] = useState<number | ''>('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [questionPool, setQuestionPool] = useState<ApiQuestionListItem[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadAll() {
    const [s, e] = await Promise.all([fetchSubjects(), listAllExams()])
    setSubjects(s)
    setExams(e)
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function onLoadQuestions() {
    if (!examSubjectId) return
    setLoadingQuestions(true)
    setError(null)
    try {
      const subject = subjects.find((s) => s.id === examSubjectId)
      if (!subject) return
      const batches = await Promise.all(subject.topics.map((t) => listQuestions({ topicId: t.id, limit: 100 })))
      const merged = batches.flat()
      const seen = new Set<number>()
      const uniq = merged.filter((q) => {
        if (seen.has(q.id)) return false
        seen.add(q.id)
        return true
      })
      setQuestionPool(uniq)
      setSelectedIds([])
      setStatus(`Loaded ${uniq.length} question(s).`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load questions')
    } finally {
      setLoadingQuestions(false)
    }
  }

  async function onCreateExam() {
    if (!tokens?.accessToken || !examSubjectId || !examTitle.trim()) return
    if (selectedIds.length < totalQuestions) {
      setError(`Select at least ${totalQuestions} questions.`)
      return
    }
    try {
      const created = await createExam(
        {
          title: examTitle.trim(),
          subjectId: Number(examSubjectId),
          durationMinutes,
          totalQuestions,
          questionIds: selectedIds.slice(0, totalQuestions),
        },
        tokens.accessToken,
      )
      setStatus(`Exam created (id ${created.id}).`)
      setExamTitle('')
      setQuestionPool([])
      setSelectedIds([])
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create exam')
    }
  }

  async function onTogglePublish(exam: ApiExam) {
    if (!tokens?.accessToken) return
    try {
      await setExamPublished(exam.id, !exam.isPublished, tokens.accessToken)
      setStatus(`Exam ${exam.isPublished ? 'unpublished' : 'published'}.`)
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update exam')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Exam builder</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and publish exams in a dedicated section.</p>
      </div>
      {status ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}
      {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-bold">Create exam</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Exam title"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:col-span-2"
          />
          <select
            value={examSubjectId}
            onChange={(e) => setExamSubjectId(e.target.value ? Number(e.target.value) : '')}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value) || 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            placeholder="Duration (min)"
          />
          <input
            type="number"
            min={1}
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value) || 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            placeholder="Total questions"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLoadQuestions}
            disabled={!examSubjectId || loadingQuestions}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loadingQuestions ? 'Loading...' : 'Load questions'}
          </button>
          <button
            type="button"
            onClick={onCreateExam}
            disabled={!examTitle.trim() || !examSubjectId || selectedIds.length < totalQuestions}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Create exam
          </button>
        </div>
        {questionPool.length > 0 ? (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            {questionPool.map((q) => (
              <label key={q.id} className="flex gap-2 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(q.id)}
                  onChange={() =>
                    setSelectedIds((prev) => (prev.includes(q.id) ? prev.filter((x) => x !== q.id) : [...prev, q.id]))
                  }
                />
                <span className="min-w-0 flex-1 truncate">
                  #{q.id} {q.questionText}
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-bold">Publish / unpublish exams</h2>
        {exams.map((exam) => (
          <div key={exam.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800">
            <span className="text-sm">{exam.title}</span>
            <button
              type="button"
              onClick={() => onTogglePublish(exam)}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {exam.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
