import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createQuestion, createSubject, createTopic, importQuestionBank } from '../services/adminApi'
import { createExam, listAllExams, setExamPublished } from '../services/examsApi'
import { listQuestions } from '../services/questionsApi'
import { fetchSubjects } from '../services/subjectsApi'
import type { ApiExam, ApiQuestionListItem, ApiSubject } from '../types/api'

export default function AdminPanelPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [exams, setExams] = useState<ApiExam[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [topicName, setTopicName] = useState('')
  const [topicSubjectId, setTopicSubjectId] = useState<number | ''>('')
  const [questionTopicId, setQuestionTopicId] = useState<number | ''>('')
  const [questionType, setQuestionType] = useState<'MCQ' | 'TF'>('MCQ')
  const [questionDifficulty, setQuestionDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [questionText, setQuestionText] = useState('')
  const [questionExplanation, setQuestionExplanation] = useState('')
  const [mcqOptions, setMcqOptions] = useState(['', '', '', ''])
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0)
  const [tfCorrect, setTfCorrect] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const [importClearExisting, setImportClearExisting] = useState(false)
  const [importFilePath, setImportFilePath] = useState('')
  const [importingBank, setImportingBank] = useState(false)

  async function loadAll() {
    const [s, e] = await Promise.all([fetchSubjects(), listAllExams()])
    setSubjects(s)
    setExams(e)
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function onImportQuestionBank() {
    if (!tokens?.accessToken) return
    setImportingBank(true)
    setError(null)
    try {
      const result = await importQuestionBank(
        {
          clearExisting: importClearExisting,
          filePath: importFilePath.trim() || undefined,
        },
        tokens.accessToken,
      )
      setStatus(
        `Import done: +${result.questionsCreated} questions, skipped ${result.questionsSkipped} (${result.subjectsCreated} subjects, ${result.topicsCreated} topics new)`,
      )
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setImportingBank(false)
    }
  }

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

  async function onTogglePublish(exam: ApiExam) {
    if (!tokens?.accessToken) return
    try {
      await setExamPublished(exam.id, !exam.isPublished, tokens.accessToken)
      setStatus(`Exam ${!exam.isPublished ? 'published' : 'unpublished'}`)
      setError(null)
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update exam publish state')
    }
  }

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
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create exam')
    }
  }

  async function onCreateQuestion() {
    if (!tokens?.accessToken || !questionTopicId || questionText.trim().length < 5) return
    try {
      if (questionType === 'MCQ') {
        const normalized = mcqOptions.map((o) => o.trim())
        if (normalized.some((o) => !o)) {
          setError('All MCQ options are required')
          return
        }
        await createQuestion(
          {
            topicId: Number(questionTopicId),
            type: 'MCQ',
            questionText: questionText.trim(),
            difficulty: questionDifficulty,
            explanation: questionExplanation.trim() || undefined,
            options: normalized.map((optionText, idx) => ({
              optionText,
              isCorrect: idx === mcqCorrectIndex,
            })),
          },
          tokens.accessToken,
        )
      } else {
        await createQuestion(
          {
            topicId: Number(questionTopicId),
            type: 'TF',
            questionText: questionText.trim(),
            difficulty: questionDifficulty,
            explanation: questionExplanation.trim() || undefined,
            correctBoolean: tfCorrect,
          },
          tokens.accessToken,
        )
      }
      setQuestionText('')
      setQuestionExplanation('')
      setMcqOptions(['', '', '', ''])
      setMcqCorrectIndex(0)
      setTfCorrect(true)
      setStatus('Question created')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create question')
    }
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
        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900">Import question bank</h2>
          <p className="mt-1 text-xs text-slate-500">
            Loads JSON into MySQL via the API. If you leave the path empty, the server uses its default (
            <code className="rounded bg-slate-100 px-1">src/data/questions.json</code> relative to the repo). Optional path
            must be reachable <strong>on the server machine</strong>.
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={importClearExisting}
                onChange={(e) => setImportClearExisting(e.target.checked)}
              />
              Clear existing subjects/topics/questions/exams first (destructive)
            </label>
            <input
              value={importFilePath}
              onChange={(e) => setImportFilePath(e.target.value)}
              placeholder="Server file path (optional)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={onImportQuestionBank}
              disabled={importingBank}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {importingBank ? 'Importing…' : 'Run import'}
            </button>
          </div>
        </section>

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

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900">Create Question</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select
              value={questionTopicId}
              onChange={(e) => setQuestionTopicId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select topic</option>
              {subjects.flatMap((s) =>
                s.topics.map((t) => (
                  <option key={`${s.id}-${t.id}`} value={t.id}>
                    {s.name} - {t.name}
                  </option>
                )),
              )}
            </select>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as 'MCQ' | 'TF')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="MCQ">MCQ</option>
              <option value="TF">True/False</option>
            </select>
            <select
              value={questionDifficulty}
              onChange={(e) => setQuestionDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <input
              value={questionExplanation}
              onChange={(e) => setQuestionExplanation(e.target.value)}
              placeholder="Explanation (optional)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Question text"
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />

          {questionType === 'MCQ' ? (
            <div className="mt-3 space-y-2">
              {mcqOptions.map((option, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={option}
                    onChange={(e) =>
                      setMcqOptions((prev) => prev.map((p, i) => (i === idx ? e.target.value : p)))
                    }
                    placeholder={`Option ${idx + 1}`}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setMcqCorrectIndex(idx)}
                    className={[
                      'rounded-xl px-3 py-2 text-xs font-bold',
                      mcqCorrectIndex === idx ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700',
                    ].join(' ')}
                  >
                    {mcqCorrectIndex === idx ? 'Correct' : 'Mark correct'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTfCorrect(true)}
                className={[
                  'rounded-xl px-3 py-2 text-xs font-bold',
                  tfCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700',
                ].join(' ')}
              >
                True is correct
              </button>
              <button
                type="button"
                onClick={() => setTfCorrect(false)}
                className={[
                  'rounded-xl px-3 py-2 text-xs font-bold',
                  !tfCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700',
                ].join(' ')}
              >
                False is correct
              </button>
            </div>
          )}

          <button
            onClick={onCreateQuestion}
            className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white"
          >
            Create Question
          </button>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900">Create Exam</h2>
          <p className="mt-1 text-xs text-slate-500">
            Pick a subject, load questions (optionally filter by topic/type/difficulty), select at least as many as
            &quot;Total questions&quot; — order matters; the first N selected are used.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Exam title"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              value={examSubjectId}
              onChange={(e) => {
                setExamSubjectId(e.target.value ? Number(e.target.value) : '')
                setExamFilterTopicId('')
                setExamQuestionPool([])
                setExamSelectedIds([])
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Duration (min)"
            />
            <input
              type="number"
              min={1}
              max={300}
              value={examTotalQuestions}
              onChange={(e) => setExamTotalQuestions(Number(e.target.value) || 1)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Total questions"
            />
            <select
              value={examFilterTopicId}
              onChange={(e) => setExamFilterTopicId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
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
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Any difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <select
              value={examFilterType}
              onChange={(e) => setExamFilterType(e.target.value as 'MCQ' | 'TF' | '')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Any type</option>
              <option value="MCQ">MCQ</option>
              <option value="TF">True/False</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLoadExamQuestions}
              disabled={loadingExamQuestions || !examSubjectId}
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {loadingExamQuestions ? 'Loading…' : 'Load questions'}
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={publishExamAfterCreate}
                onChange={(e) => setPublishExamAfterCreate(e.target.checked)}
              />
              Publish after create
            </label>
          </div>

          {examQuestionPool.length > 0 ? (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {examQuestionPool.map((q) => (
                <label
                  key={q.id}
                  className="flex cursor-pointer gap-2 border-b border-slate-100 py-2 text-sm last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={examSelectedIds.includes(q.id)}
                    onChange={() => toggleExamQuestionId(q.id)}
                  />
                  <span className="flex-1">
                    <span className="font-semibold text-slate-800">#{q.id}</span>{' '}
                    <span className="text-slate-600">{q.questionText.slice(0, 120)}</span>
                    <span className="block text-xs text-slate-400">
                      {q.topic.subject.name} · {q.topic.name} · {q.type} · {q.difficulty}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          <div className="mt-2 text-xs text-slate-600">
            Selected: {examSelectedIds.length} / need ≥ {examTotalQuestions} (uses first {examTotalQuestions} in
            selection order)
          </div>

          {examSelectedIds.length > 0 ? (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
              <div className="text-xs font-bold text-indigo-900">Selection order (reorder with ↑ ↓)</div>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {examSelectedIds.map((id, idx) => {
                  const q = examQuestionPool.find((x) => x.id === id)
                  return (
                    <div
                      key={`sel-${id}-${idx}`}
                      className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-xs ring-1 ring-indigo-100"
                    >
                      <span className="w-5 shrink-0 font-bold text-slate-500">{idx + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-slate-800">
                        #{id}
                        {q ? ` ${q.questionText.slice(0, 70)}${q.questionText.length > 70 ? '…' : ''}` : ' (reload pool if missing)'}
                      </span>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveExamSelectionUp(idx)}
                        className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-bold text-slate-700 disabled:opacity-40"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx >= examSelectedIds.length - 1}
                        onClick={() => moveExamSelectionDown(idx)}
                        className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-bold text-slate-700 disabled:opacity-40"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExamSelection(id)}
                        className="shrink-0 rounded-lg bg-rose-50 px-2 py-1 font-bold text-rose-700"
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
            className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create exam
          </button>
        </section>
      </div>
    </div>
  )
}

