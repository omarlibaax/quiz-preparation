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
      <div className="relative z-10 flex min-h-[40vh] items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-2xl border border-slate-200/90 bg-white/95 p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-bold text-slate-900 dark:text-white">No attempt found</p>
          <p className="mt-2 text-sm text-slate-500">Start a quiz from home or setup to see results here.</p>
        </div>
      </div>
    )
  }

  const { correct, wrong, skipped } = summary
  const weakTopics = [...attempt.perTopic].sort((a, b) => a.percent - b.percent).slice(0, 5)

  return (
    <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Result</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Quiz completed</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {attempt.setup.subjectName}
              {attempt.questions[0]?.topicName ? ` • ${attempt.questions[0].topicName}` : ''}
            </p>
            <p className="mt-4 text-xs text-slate-500">Time taken: {attempt.timeTakenSeconds}s</p>
          </div>
          <div className="lg:col-span-5">
            <div className="h-full rounded-2xl bg-gradient-to-br from-[#845adf] to-indigo-700 p-6 text-white shadow-card-lg">
              <div className="text-xs font-bold uppercase tracking-wide text-white/80">Score</div>
              <div className="mt-2 text-5xl font-black tabular-nums">{attempt.score.percent}%</div>
              <div className="mt-2 text-sm font-semibold text-white/90">
                {attempt.score.correct}/{attempt.score.total} correct
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Correct</div>
            <div className="mt-2 text-3xl font-black text-emerald-800 dark:text-emerald-200">{correct}</div>
          </div>
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/90 p-5 dark:border-rose-900/40 dark:bg-rose-950/30">
            <div className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">Wrong</div>
            <div className="mt-2 text-3xl font-black text-rose-800 dark:text-rose-200">{wrong}</div>
          </div>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 dark:border-amber-900/40 dark:bg-amber-950/30">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Skipped</div>
            <div className="mt-2 text-3xl font-black text-amber-900 dark:text-amber-100">{skipped}</div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Weak topics</h2>
            <span className="text-xs font-semibold text-slate-500">By accuracy</span>
          </div>
          <div className="mt-4 space-y-3">
            {weakTopics.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">No topic data available.</p>
            ) : (
              weakTopics.map((t) => (
                <div
                  key={t.topicName}
                  className="rounded-xl border border-slate-100 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.topicName}</span>
                    <span className="text-sm font-black text-[#845adf]">{t.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/review')}
            className="flex-1 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Review answers
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

