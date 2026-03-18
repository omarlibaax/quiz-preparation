import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerValue, QuizQuestion } from '../types/quiz'
import { readLastAttempt } from '../utils/attemptStorage'

function countCorrectWrongSkipped(questions: QuizQuestion[], answersById: Record<string, AnswerValue>) {
  let correct = 0
  let wrong = 0
  let skipped = 0
  for (const q of questions) {
    const a = answersById[q.id] ?? null
    const answered = a !== null
    const ok = q.type === 'mcq' ? a === q.answer : a === q.answer
    if (!answered) skipped += 1
    else if (ok) correct += 1
    else wrong += 1
  }
  return { correct, wrong, skipped }
}

export default function ResultPage() {
  const navigate = useNavigate()
  const attempt = readLastAttempt()

  const summary = useMemo(() => {
    if (!attempt) return null
    return countCorrectWrongSkipped(attempt.questions, attempt.answersById)
  }, [attempt])

  if (!attempt || !summary) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-100/70">
          No attempt found. Please start a quiz again.
        </div>
      </div>
    )
  }

  const { correct, wrong, skipped } = summary
  const weakTopics = [...attempt.perTopic].sort((a, b) => a.percent - b.percent).slice(0, 5)

  return (
    <div className="flex-1 px-1 sm:px-4">
      <div className="mx-auto w-full max-w-3xl py-5 sm:py-6">
        <div className="rounded-[2rem] bg-white p-4 sm:p-5 shadow-xl ring-1 ring-slate-100/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Result
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Quiz completed</h1>
              <div className="mt-1 text-sm text-slate-600">
                {attempt.setup.subjectName}
                {attempt.questions[0]?.topicName ? ` • ${attempt.questions[0].topicName}` : ''}
              </div>
            </div>

            <div className="text-right">
              <div className="rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-white shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Score</div>
                <div className="mt-1 text-3xl font-extrabold">{attempt.score.percent}%</div>
                <div className="mt-1 text-xs font-semibold opacity-90">
                  {attempt.score.correct}/{attempt.score.total} correct
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-[1.4rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <div className="text-xs font-semibold text-emerald-700">Correct</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-800">{correct}</div>
            </div>
            <div className="rounded-[1.4rem] bg-rose-50 p-4 ring-1 ring-rose-100">
              <div className="text-xs font-semibold text-rose-700">Wrong</div>
              <div className="mt-1 text-2xl font-extrabold text-rose-800">{wrong}</div>
            </div>
            <div className="rounded-[1.4rem] bg-amber-50 p-4 ring-1 ring-amber-100">
              <div className="text-xs font-semibold text-amber-700">Skipped</div>
              <div className="mt-1 text-2xl font-extrabold text-amber-800">{skipped}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900">Weak Topics</div>
              <div className="text-xs font-semibold text-slate-500">
                Based on accuracy
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {weakTopics.length === 0 ? (
                <div className="text-sm text-slate-600">No topic data available.</div>
              ) : (
                weakTopics.map((t) => (
                  <div
                    key={t.topicName}
                    className="rounded-[1.2rem] bg-white p-3 ring-1 ring-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-800">{t.topicName}</div>
                      <div className="text-xs font-bold text-slate-900">{t.percent}%</div>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                        style={{ width: `${t.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/review')}
              className="flex-1 rounded-[2rem] bg-slate-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800"
            >
              Review Answers
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-[2rem] bg-white px-4 py-3 text-sm font-extrabold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Home
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Time taken: {attempt.timeTakenSeconds}s
          </div>
        </div>
      </div>
    </div>
  )
}

