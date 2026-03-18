import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { listSubjects } from '../utils/questionBank'
import type { Difficulty, QuizMode, QuestionType, QuizSetup } from '../types/quiz'
import { writeJson, readJson } from '../utils/storage'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

const PREF_KEY = 'prefs'

type Prefs = Omit<QuizSetup, 'subjectName'> & { lastSubjectName?: string }

export default function SetupPage() {
  const subjects = listSubjects()
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
    }
    writeJson(PREF_KEY, { numberOfQuestions, timeLimitSeconds, difficulty, questionType, mode, lastSubjectName: subjectName })
    writeJson('currentSetup', setup)
    navigate('/quiz')
  }

  return (
    <div className="flex-1 px-4">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-slate-100">
          ← Home
        </Link>
        <div className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-100 shadow">
          Setup Quiz
        </div>
        <div className="w-10" />
      </header>

      <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
        <h1 className="text-lg font-bold text-slate-900">Configure your test</h1>
        <p className="mt-1 text-xs text-slate-500">
          Subject:{' '}
          <span className="font-semibold text-slate-900">{subjectName || '—'}</span>
        </p>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-3">
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

          <div className="rounded-2xl bg-slate-50 p-3">
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

          <div className="rounded-2xl bg-slate-50 p-3">
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

          <div className="rounded-2xl bg-slate-50 p-3">
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

          <div className={`rounded-2xl bg-slate-50 p-3 ${mode === 'practice' ? 'opacity-50' : ''}`}>
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
        </div>

        <button
          type="button"
          onClick={start}
          disabled={!canStart}
          className={[
            'mt-5 w-full rounded-3xl px-4 py-3 text-sm font-bold shadow-md transition',
            canStart
              ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-600 hover:to-sky-600'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed',
          ].join(' ')}
        >
          Start quiz
        </button>
      </div>
    </div>
  )
}

