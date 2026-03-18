import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerValue, QuizQuestion } from '../types/quiz'
import { readLastAttempt } from '../utils/attemptStorage'

function isCorrect(q: QuizQuestion, a: AnswerValue) {
  if (a === null) return false
  return q.type === 'mcq' ? a === q.answer : a === q.answer
}

function formatAnswer(q: QuizQuestion, a: AnswerValue) {
  if (a === null) return 'Skipped'
  if (q.type === 'tf') return (a as boolean) ? 'True' : 'False'
  return String(a)
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const attempt = readLastAttempt()

  const [activeIndex, setActiveIndex] = useState(0)

  const question = attempt?.questions[activeIndex]
  const a = question ? (attempt?.answersById[question.id] ?? null) : null
  const correct = question ? isCorrect(question, a) : false

  const navigator = useMemo(() => {
    if (!attempt) return []
    return attempt.questions.map((q, i) => {
      const ans = attempt.answersById[q.id] ?? null
      const answered = ans !== null
      const ok = isCorrect(q, ans)
      const review = !!attempt.markedForReview[q.id]
      return { i, answered, ok, review }
    })
  }, [attempt])

  if (!attempt || !question) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
          No attempt found. Please start a quiz again.
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4">
      <div className="mx-auto w-full max-w-3xl py-6">
        <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Review
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                Answer Review
              </h1>
              <div className="mt-1 text-sm text-slate-600">
                {attempt.setup.subjectName} • {attempt.setup.mode}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-3xl bg-white px-4 py-2 text-sm font-extrabold text-slate-800 ring-1 ring-slate-200"
            >
              Home
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-500">
              Question {activeIndex + 1} / {attempt.questions.length}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {question.topicName}
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="text-sm font-bold text-slate-900">{question.question}</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                <div className="text-xs font-semibold text-slate-500">Your answer</div>
                <div
                  className={[
                    'mt-1 text-sm font-extrabold',
                    a === null ? 'text-amber-700' : correct ? 'text-emerald-700' : 'text-rose-700',
                  ].join(' ')}
                >
                  {formatAnswer(question, a)}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                <div className="text-xs font-semibold text-slate-500">Correct answer</div>
                <div className="mt-1 text-sm font-extrabold text-sky-800">
                  {formatAnswer(question, question.answer as AnswerValue)}
                </div>
              </div>
            </div>

            {question.explanation ? (
              <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                <div className="text-xs font-semibold text-slate-500">Explanation</div>
                <div className="mt-1 text-sm font-semibold text-slate-700">{question.explanation}</div>
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-900">All Questions</div>
              <div className="text-[11px] font-semibold text-slate-500">Tap a number to jump</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {navigator.map((n) => {
                const isActive = n.i === activeIndex
                const base =
                  n.review
                    ? 'bg-[#A855F7] text-white ring-[#A855F7]'
                    : n.answered
                      ? n.ok
                        ? 'bg-emerald-600 text-white ring-emerald-600'
                        : 'bg-rose-600 text-white ring-rose-600'
                      : 'bg-slate-200 text-slate-600 ring-slate-200'
                return (
                  <button
                    key={n.i}
                    type="button"
                    onClick={() => setActiveIndex(n.i)}
                    className={[
                      'h-10 w-10 rounded-2xl text-sm font-extrabold ring-1 transition',
                      base,
                      isActive ? 'ring-2 ring-slate-900' : '',
                    ].join(' ')}
                  >
                    {n.i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

