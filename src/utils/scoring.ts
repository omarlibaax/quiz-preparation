import type { AnswerValue, QuizAttempt, QuizQuestion, QuizSetup } from '../types/quiz'

function isCorrect(q: QuizQuestion, a: AnswerValue) {
  if (a === null) return false
  if (q.type === 'mcq') return a === q.answer
  return a === q.answer
}

export function buildAttempt(params: {
  setup: QuizSetup
  questions: QuizQuestion[]
  answersById: Record<string, AnswerValue>
  markedForReview: Record<string, boolean>
  startedAt: string
  finishedAt: string
}): QuizAttempt {
  const { setup, questions, answersById, markedForReview, startedAt, finishedAt } = params
  const correct = questions.reduce((acc, q) => acc + (isCorrect(q, answersById[q.id] ?? null) ? 1 : 0), 0)
  const total = questions.length
  const percent = total === 0 ? 0 : Math.round((correct / total) * 1000) / 10

  const byTopic = new Map<string, { correct: number; total: number }>()
  for (const q of questions) {
    const entry = byTopic.get(q.topicName) ?? { correct: 0, total: 0 }
    entry.total += 1
    if (isCorrect(q, answersById[q.id] ?? null)) entry.correct += 1
    byTopic.set(q.topicName, entry)
  }

  const perTopic = [...byTopic.entries()]
    .map(([topicName, v]) => ({
      topicName,
      correct: v.correct,
      total: v.total,
      percent: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 1000) / 10,
    }))
    .sort((a, b) => a.percent - b.percent)

  const started = new Date(startedAt).getTime()
  const finished = new Date(finishedAt).getTime()
  const timeTakenSeconds = Math.max(0, Math.round((finished - started) / 1000))

  return {
    id: crypto.randomUUID(),
    createdAt: finishedAt,
    setup,
    questions,
    answersById,
    markedForReview,
    startedAt,
    finishedAt,
    timeTakenSeconds,
    score: { correct, total, percent },
    perTopic,
  }
}

