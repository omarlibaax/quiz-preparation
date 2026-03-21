import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { listSubjects, listTopicsForSubject } from '../utils/questionBank'
import type { Difficulty, QuizMode, QuestionType, QuizSetup } from '../types/quiz'
import { writeJson, readJson } from '../utils/storage'
import { fetchSubjects } from '../services/subjectsApi'
import { listPublishedExamsBySubject } from '../services/examsApi'
import type { ApiExam, ApiSubject } from '../types/api'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

const PREF_KEY = 'prefs'

type Prefs = Omit<QuizSetup, 'subjectName'> & { lastSubjectName?: string }

export default function SetupPage() {
  const localSubjects = useMemo(() => listSubjects(), [])
  const [subjects, setSubjects] = useState(localSubjects)
  const q = useQuery()
  const navigate = useNavigate()
  const initialPrefs = readJson<Prefs>(PREF_KEY, {
    numberOfQuestions: 10,
    timeLimitSeconds: 10 * 60,
    difficulty: 'mixed',
    questionType: 'mixed',
    mode: 'timed',
  })

  const subjectName = q.get('subject') ?? initialPrefs.lastSubjectName ?? subjects[0]?.name ?? ''
  const [topicName, setTopicName] = useState<string | undefined>(initialPrefs.topicName)

  const topics = useMemo(() => {
    const apiSubject = subjects.find((s) => s.name === subjectName)
    if (apiSubject) return apiSubject.topics
    return listTopicsForSubject(subjectName)
  }, [subjectName, subjects])
  const canPickTopic = topics.length > 1

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const apiSubjects: ApiSubject[] = await fetchSubjects()
        if (!cancelled && apiSubjects.length > 0) {
          setSubjects(
            apiSubjects.map((s) => ({
              name: s.name,
              topics: s.topics.map((t) => t.name),
            })),
          )
        }
      } catch {
        // keep local fallback
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const [numberOfQuestions, setNumberOfQuestions] = useState(initialPrefs.numberOfQuestions)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | null>(initialPrefs.timeLimitSeconds)
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>(initialPrefs.difficulty)
  const [questionType, setQuestionType] = useState<QuestionType | 'mixed'>(initialPrefs.questionType)
  const [mode, setMode] = useState<QuizMode>(initialPrefs.mode)
  const [publishedExams, setPublishedExams] = useState<ApiExam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<number | undefined>(undefined)

  const canStart = subjectName.length > 0 && numberOfQuestions > 0

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!subjectName) {
        setPublishedExams([])
        setSelectedExamId(undefined)
        return
      }
      try {
        const exams = await listPublishedExamsBySubject(subjectName)
        if (!cancelled) {
          setPublishedExams(exams)
          setSelectedExamId(exams[0]?.id)
        }
      } catch {
        if (!cancelled) {
          setPublishedExams([])
          setSelectedExamId(undefined)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [subjectName])

  function start() {
    if (!canStart) return
    const setup: QuizSetup = {
      subjectName,
      examId: selectedExamId,
      numberOfQuestions,
      timeLimitSeconds: mode === 'practice' ? null : timeLimitSeconds ?? 10 * 60,
      difficulty,
      questionType,
      mode,
      topicName: canPickTopic ? topicName : undefined,
    }
    writeJson(PREF_KEY, {
      numberOfQuestions,
      timeLimitSeconds,
      difficulty,
      questionType,
      mode,
      lastSubjectName: subjectName,
      topicName: canPickTopic ? topicName : undefined,
    })
    writeJson('currentSetup', setup)
    navigate('/quiz')
  }

  return (
    <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quiz setup</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Configure your session
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Subject: <span className="font-bold text-[#845adf]">{subjectName || '—'}</span> — tune mode, length, and difficulty
              before you begin.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            ← Back to home
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {publishedExams.length > 0 ? (
            <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Published exam</h2>
              <p className="mt-1 text-xs text-slate-500">Pick an exam when available</p>
              <div className="mt-4 grid gap-2">
                {publishedExams.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setSelectedExamId(exam.id)}
                    className={[
                      'rounded-xl border px-4 py-3 text-left transition',
                      selectedExamId === exam.id
                        ? 'border-[#845adf] bg-[#845adf]/10 ring-2 ring-[#845adf]/25'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80',
                    ].join(' ')}
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{exam.title}</div>
                    <div className="text-xs text-slate-500">
                      {exam.totalQuestions} questions • {exam.durationMinutes} min
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-200/90 bg-white/40 p-6 dark:border-slate-700 dark:bg-slate-900/40">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">No published exams</h2>
              <p className="mt-2 text-xs text-slate-500">Using the local question bank for this subject.</p>
            </section>
          )}

          {canPickTopic ? (
            <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Topic focus</h2>
              <p className="mt-1 text-xs text-slate-500">Filter by sub-category</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTopicName(undefined)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                    topicName === undefined
                      ? 'bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900'
                      : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200',
                  ].join(' ')}
                >
                  All topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopicName(t)}
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                      topicName === t
                        ? 'bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900'
                        : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mode</h2>
            <div className="mt-4 grid gap-2">
              {(['timed', 'practice', 'adaptive'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    'rounded-xl px-4 py-3 text-left text-sm font-bold capitalize ring-1 transition',
                    mode === m
                      ? 'bg-[#845adf] text-white ring-[#845adf]'
                      : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-100',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Questions</h2>
            <p className="mt-1 text-xs text-slate-500">How many items in this run</p>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                className="w-full accent-[#845adf]"
              />
              <div className="w-10 text-right text-lg font-black tabular-nums text-[#845adf]">{numberOfQuestions}</div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:col-span-2 xl:col-span-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Difficulty</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['mixed', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={[
                    'rounded-xl px-3 py-2 text-xs font-bold capitalize ring-1 transition sm:text-sm',
                    difficulty === d
                      ? 'bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900'
                      : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-200',
                  ].join(' ')}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-6 dark:border-slate-800 dark:bg-slate-800/40">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Question type</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(['mixed', 'mcq', 'tf'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setQuestionType(t)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-bold uppercase ring-1 transition',
                    questionType === t
                      ? 'bg-emerald-600 text-white ring-emerald-600'
                      : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section
            className={`rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 ${
              mode === 'practice' ? 'opacity-60' : ''
            }`}
          >
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Time limit</h2>
            <p className="mt-1 text-xs text-slate-500">Practice mode disables the timer</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[5, 10, 20].map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={mode === 'practice'}
                  onClick={() => setTimeLimitSeconds(m * 60)}
                  className={[
                    'rounded-xl px-3 py-3 text-sm font-bold ring-1 transition',
                    timeLimitSeconds === m * 60 ? 'bg-amber-500 text-white ring-amber-500' : 'bg-slate-50 text-slate-800 ring-slate-200',
                    mode === 'practice' ? 'cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  {m} min
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Ready when you are — you can tweak settings anytime before starting.</p>
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className={[
              'w-full rounded-2xl px-8 py-4 text-base font-extrabold uppercase tracking-wide shadow-lg transition sm:w-auto',
              canStart
                ? 'bg-gradient-to-r from-[#845adf] to-indigo-600 text-white shadow-[#845adf]/25 hover:opacity-95'
                : 'cursor-not-allowed bg-slate-200 text-slate-500',
            ].join(' ')}
          >
            Start quiz
          </button>
        </div>
      </div>
    </div>
  )
}

