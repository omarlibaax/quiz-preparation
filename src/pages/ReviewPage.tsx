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
      <div className="relative z-10 flex min-h-[40vh] items-center justify-center px-4 py-16">
        <p className="rounded-2xl border border-slate-200/90 bg-white/95 px-8 py-6 text-sm font-semibold text-slate-600 shadow-card dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          No attempt found. Start a quiz first.
        </p>
      </div>
    )
  }

  return (
    <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Review</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Answer review</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {attempt.setup.subjectName} • {attempt.setup.mode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Home
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-bold text-slate-700 dark:text-slate-200">
            Question {activeIndex + 1} / {attempt.questions.length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {question.topicName}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <p className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white">{question.question}</p>
              {question.explanation ? (
                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Explanation</div>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{question.explanation}</p>
                </div>
              ) : null}
            </div>
          </section>
          <section className="lg:col-span-5">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Your answer</div>
                <div
                  className={[
                    'mt-2 text-lg font-extrabold',
                    a === null ? 'text-amber-600' : correct ? 'text-emerald-600' : 'text-rose-600',
                  ].join(' ')}
                >
                  {formatAnswer(question, a)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Correct answer</div>
                <div className="mt-2 text-lg font-extrabold text-sky-700 dark:text-sky-300">
                  {formatAnswer(question, question.answer as AnswerValue)}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">All questions</span>
            <span className="text-[11px] font-semibold text-slate-500">Tap to jump</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {navigator.map((n) => {
              const isActive = n.i === activeIndex
              const base = n.review
                ? 'bg-violet-600 text-white ring-violet-600'
                : n.answered
                  ? n.ok
                    ? 'bg-emerald-600 text-white ring-emerald-600'
                    : 'bg-rose-600 text-white ring-rose-600'
                  : 'bg-slate-200 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-100'
              return (
                <button
                  key={n.i}
                  type="button"
                  onClick={() => setActiveIndex(n.i)}
                  className={[
                    'h-10 min-w-[2.5rem] rounded-xl text-sm font-extrabold ring-1 transition',
                    base,
                    isActive ? 'ring-2 ring-[#845adf] ring-offset-2 dark:ring-offset-slate-900' : '',
                  ].join(' ')}
                >
                  {n.i + 1}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

