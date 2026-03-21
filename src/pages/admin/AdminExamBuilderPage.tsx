import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createExam, setExamPublished } from '../../services/examsApi'
import { listQuestions } from '../../services/questionsApi'
import { fetchSubjects } from '../../services/subjectsApi'
import type { ApiQuestionListItem, ApiSubject } from '../../types/api'

/**
 * Build a new exam: pick subject, load questions, order selection, publish.
 */
export default function AdminExamBuilderPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])

  const [examTitle, setExamTitle] = useState('')
  const [examSubjectId, setExamSubjectId] = useState<number | ''>('')
  const [examDurationMinutes, setExamDurationMinutes] = useState(30)
  const [examTotalQuestions, setExamTotalQuestions] = useState(10)
  const [examFilterTopicId, setExamFilterTopicId] = useState<number | ''>('')
  const [examFilterDifficulty, setExamFilterDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('')
  const [examFilterType, setExamFilterType] = useState<'MCQ' | 'TF' | ''>('')
  const [examQuestionPool, setExamQuestionPool] = useState<ApiQuestionListItem[]>([])
  const [examSelectedIds, setExamSelectedIds] = useState<number[]>([])
  const [loadingExamQuestions, setLoadingExamQuestions] = useState(false)
  const [publishExamAfterCreate, setPublishExamAfterCreate] = useState(false)

  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadSubjects() {
    const s = await fetchSubjects()
    setSubjects(s)
  }

  useEffect(() => {
    void loadSubjects()
  }, [])

  const examTopicsForSubject = examSubjectId
    ? subjects.find((s) => s.id === examSubjectId)?.topics ?? []
    : []

  function toggleExamQuestionId(id: number) {
    setExamSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function moveExamSelectionUp(index: number) {
    if (index <= 0) return
    setExamSelectedIds((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveExamSelectionDown(index: number) {
    setExamSelectedIds((prev) => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  function removeExamSelection(id: number) {
    setExamSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  async function onLoadExamQuestions() {
    if (!examSubjectId) {
      setError('Select a subject for the exam first')
      return
    }
    setLoadingExamQuestions(true)
    setError(null)
    try {
      const sub = subjects.find((s) => s.id === examSubjectId)
      if (!sub) return
      const diff = examFilterDifficulty || undefined
      const typ = examFilterType || undefined
      let rows: ApiQuestionListItem[] = []
      if (examFilterTopicId) {
        rows = await listQuestions({
          topicId: Number(examFilterTopicId),
          difficulty: diff,
          type: typ,
          limit: 100,
        })
      } else {
        const batches = await Promise.all(
          sub.topics.map((t) =>
            listQuestions({
              topicId: t.id,
              difficulty: diff,
              type: typ,
              limit: 100,
            }),
          ),
        )
        rows = batches.flat()
        const seen = new Set<number>()
        rows = rows.filter((q) => {
          if (seen.has(q.id)) return false
          seen.add(q.id)
          return true
        })
      }
      setExamQuestionPool(rows)
      setExamSelectedIds([])
      setStatus(`Loaded ${rows.length} question(s)`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load questions')
    } finally {
      setLoadingExamQuestions(false)
    }
  }

  async function onCreateExam() {
    if (!tokens?.accessToken || !examSubjectId || !examTitle.trim()) return
    if (examSelectedIds.length < examTotalQuestions) {
      setError(`Select at least ${examTotalQuestions} question(s) in order (first ${examTotalQuestions} will be used).`)
      return
    }
    try {
      const questionIds = examSelectedIds.slice(0, examTotalQuestions)
      const created = await createExam(
        {
          title: examTitle.trim(),
          subjectId: Number(examSubjectId),
          durationMinutes: examDurationMinutes,
          totalQuestions: examTotalQuestions,
          questionIds,
        },
        tokens.accessToken,
      )
      if (publishExamAfterCreate) {
        await setExamPublished(created.id, true, tokens.accessToken)
      }
      setExamTitle('')
      setExamQuestionPool([])
      setExamSelectedIds([])
      setStatus(
        publishExamAfterCreate
          ? `Exam created and published (id ${created.id})`
          : `Exam created (id ${created.id})`,
      )
      setError(null)
      await loadSubjects()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create exam')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Create exam</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pick a subject, load questions, select and order them, then publish from{' '}
            <Link to="/admin/exams" className="font-semibold text-[#845adf] hover:underline dark:text-[#c4b5fd]">
              All exams
            </Link>
            .
          </p>
        </div>
        <Link
          to="/admin/exams"
          className="shrink-0 text-sm font-semibold text-[#845adf] hover:underline dark:text-[#c4b5fd]"
        >
          View all exams →
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

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick publish</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Toggle publish state for existing exams (same list as All exams).
        </p>
        <div className="mt-4 space-y-2">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{exam.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{exam.subject.name}</div>
              </div>
              <button
                type="button"
                onClick={() => onTogglePublish(exam)}
                className={[
                  'rounded-xl px-3 py-2 text-xs font-bold',
                  exam.isPublished
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
                ].join(' ')}
              >
                {exam.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          ))}
          {exams.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">No exams yet — create one below.</div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">New exam</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Pick a subject, load questions (optionally filter by topic/type/difficulty), select at least as many as
          &quot;Total questions&quot; — order matters; the first N selected are used.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Exam title"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white sm:col-span-2"
          />
          <select
            value={examSubjectId}
            onChange={(e) => {
              setExamSubjectId(e.target.value ? Number(e.target.value) : '')
              setExamFilterTopicId('')
              setExamQuestionPool([])
              setExamSelectedIds([])
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
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
            max={300}
            value={examDurationMinutes}
            onChange={(e) => setExamDurationMinutes(Number(e.target.value) || 1)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            placeholder="Duration (min)"
          />
          <input
            type="number"
            min={1}
            max={300}
            value={examTotalQuestions}
            onChange={(e) => setExamTotalQuestions(Number(e.target.value) || 1)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            placeholder="Total questions"
          />
          <select
            value={examFilterTopicId}
            onChange={(e) => setExamFilterTopicId(e.target.value ? Number(e.target.value) : '')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white sm:col-span-2"
            disabled={!examSubjectId}
          >
            <option value="">All topics in subject (or pick one)</option>
            {examTopicsForSubject.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={examFilterDifficulty}
            onChange={(e) => setExamFilterDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD' | '')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Any difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          <select
            value={examFilterType}
            onChange={(e) => setExamFilterType(e.target.value as 'MCQ' | 'TF' | '')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Any type</option>
            <option value="MCQ">MCQ</option>
            <option value="TF">True/False</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onLoadExamQuestions}
            disabled={loadingExamQuestions || !examSubjectId}
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
          >
            {loadingExamQuestions ? 'Loading…' : 'Load questions'}
          </button>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={publishExamAfterCreate}
              onChange={(e) => setPublishExamAfterCreate(e.target.checked)}
              className="rounded border-slate-300 text-[#845adf] focus:ring-[#845adf]"
            />
            Publish after create
          </label>
        </div>

        {examQuestionPool.length > 0 ? (
          <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            {examQuestionPool.map((q) => (
              <label
                key={q.id}
                className="flex cursor-pointer gap-2 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-800"
              >
                <input
                  type="checkbox"
                  checked={examSelectedIds.includes(q.id)}
                  onChange={() => toggleExamQuestionId(q.id)}
                  className="mt-1 rounded border-slate-300 text-[#845adf] focus:ring-[#845adf]"
                />
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">#{q.id}</span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">{q.questionText.slice(0, 120)}</span>
                  <span className="block text-xs text-slate-400">
                    {q.topic.subject.name} · {q.topic.name} · {q.type} · {q.difficulty}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : null}

        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Selected: {examSelectedIds.length} / need ≥ {examTotalQuestions} (uses first {examTotalQuestions} in selection
          order)
        </div>

        {examSelectedIds.length > 0 ? (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Selection order (reorder with ↑ ↓)</div>
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {examSelectedIds.map((id, idx) => {
                const q = examQuestionPool.find((x) => x.id === id)
                return (
                  <div
                    key={`sel-${id}-${idx}`}
                    className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-xs ring-1 ring-indigo-100 dark:bg-slate-900/80 dark:ring-indigo-900/40"
                  >
                    <span className="w-5 shrink-0 font-bold text-slate-500">{idx + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-800 dark:text-slate-200">
                      #{id}
                      {q
                        ? ` ${q.questionText.slice(0, 70)}${q.questionText.length > 70 ? '…' : ''}`
                        : ' (reload pool if missing)'}
                    </span>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveExamSelectionUp(idx)}
                      className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-bold text-slate-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx >= examSelectedIds.length - 1}
                      onClick={() => moveExamSelectionDown(idx)}
                      className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-bold text-slate-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExamSelection(id)}
                      className="shrink-0 rounded-lg bg-rose-50 px-2 py-1 font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCreateExam}
          disabled={!examTitle.trim() || !examSubjectId || examSelectedIds.length < examTotalQuestions}
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create exam
        </button>
      </section>
    </div>
  )
}
