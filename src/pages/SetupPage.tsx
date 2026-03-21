import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { listSubjects, listTopicsForSubject } from '../utils/questionBank'
import type { Difficulty, QuizMode, QuestionType, QuizSetup } from '../types/quiz'
import { writeJson, readJson } from '../utils/storage'
import { fetchSubjects } from '../services/subjectsApi'
import type { ApiSubject } from '../types/api'

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

  const canStart = subjectName.length > 0 && numberOfQuestions > 0

  function start() {
    if (!canStart) return
    const setup: QuizSetup = {
      subjectName,
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
    <div className="flex-1 p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          ← Back
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Setup</div>
        <div className="w-10" />
      </header>

      <div className="overflow-hidden rounded-3xl bg-white/80 shadow-sm ring-1 ring-slate-200/80">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-6 py-6 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-90">
            {subjectName || 'Subject'}
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">Select your difficulty & mode</h1>
          <p className="mt-1 text-[11px] text-sky-100">
            Tune the quiz to match your preparation level.
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-6 md:p-7">

          <div className="mt-5 space-y-4">

          {canPickTopic ? (
            <div className="rounded-3xl bg-white p-5">
              <label className="text-sm font-semibold text-slate-700">Sub-category (Topic)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTopicName(undefined)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                    topicName === undefined
                      ? 'bg-slate-900 text-white ring-slate-900'
                      : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                  ].join(' ')}
                >
                  All Topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopicName(t)}
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                      topicName === t
                        ? 'bg-slate-900 text-white ring-slate-900'
                        : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl bg-white p-5">
            <label className="text-sm font-semibold text-slate-700">Mode</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['timed', 'practice', 'adaptive'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                    mode === m ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5">
            <label className="text-sm font-semibold text-slate-700">Number of questions</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-10 text-right text-sm font-semibold text-slate-900">{numberOfQuestions}</div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5">
            <label className="text-sm font-semibold text-slate-700">Difficulty</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(['mixed', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                    difficulty === d ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <label className="text-sm font-semibold text-slate-700">Question type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['mixed', 'mcq', 'tf'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setQuestionType(t)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                    questionType === t ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl bg-white p-5 ${mode === 'practice' ? 'opacity-50' : ''}`}>
            <label className="text-sm font-semibold text-slate-700">Time limit</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[5, 10, 20].map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={mode === 'practice'}
                  onClick={() => setTimeLimitSeconds(m * 60)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition',
                    timeLimitSeconds === m * 60 ? 'bg-amber-500 text-white ring-amber-500' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                    mode === 'practice' ? 'cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  {m}m
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Practice mode has no timer.</p>
          </div>
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className={[
              'mt-4 w-full rounded-3xl px-6 py-5 text-base font-bold shadow-sm transition',
              canStart
                ? 'bg-sky-500 text-white hover:bg-sky-600'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed',
            ].join(' ')}
          >
            Start quiz
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

