import bankJson from '../data/questions.json'
import type { QuestionBank, QuizQuestion, QuizSetup, Question, Difficulty } from '../types/quiz'
import { shuffle } from './shuffle'
import { readJson, writeJson } from './storage'

const bank = bankJson as QuestionBank

type RecentHistory = {
  recentQuestionIds: string[]
}

const HISTORY_KEY = 'history'
const HISTORY_LIMIT = 120

function toQuizQuestion(q: Question, subjectName: string, topicName: string): QuizQuestion {
  if (q.type === 'mcq') {
    return {
      ...q,
      subjectName,
      topicName,
      optionsShuffled: shuffle(q.options),
    }
  }
  return { ...q, subjectName, topicName }
}

function difficultyRank(d: Difficulty) {
  return d === 'easy' ? 0 : d === 'medium' ? 1 : 2
}

export function listSubjects() {
  return bank.subjects.map((s) => ({
    name: s.name,
    topics: s.topics.map((t) => t.name),
  }))
}

export function generateQuiz(setup: QuizSetup): QuizQuestion[] {
  const subject = bank.subjects.find((s) => s.name === setup.subjectName)
  if (!subject) return []

  const topics = setup.topicName ? subject.topics.filter((t) => t.name === setup.topicName) : subject.topics
  const allQuestions: QuizQuestion[] = topics.flatMap((t) =>
    t.questions.map((q) => toQuizQuestion(q, subject.name, t.name)),
  )

  const filtered = allQuestions.filter((q) => {
    const typeOk = setup.questionType === 'mixed' ? true : q.type === setup.questionType
    const diffOk = setup.difficulty === 'mixed' ? true : q.difficulty === setup.difficulty
    return typeOk && diffOk
  })

  const history = readJson<RecentHistory>(HISTORY_KEY, { recentQuestionIds: [] })
  const recent = new Set(history.recentQuestionIds)
  const unseen = filtered.filter((q) => !recent.has(q.id))
  const pool = unseen.length >= setup.numberOfQuestions ? unseen : filtered

  const picked = shuffle(pool).slice(0, Math.max(1, setup.numberOfQuestions))

  const nextHistoryIds = [...picked.map((q) => q.id), ...history.recentQuestionIds].slice(0, HISTORY_LIMIT)
  writeJson(HISTORY_KEY, { recentQuestionIds: nextHistoryIds } satisfies RecentHistory)

  return picked
}

export function pickAdaptiveNextDifficulty(current: Difficulty, wasCorrect: boolean): Difficulty {
  const rank = difficultyRank(current)
  const nextRank = Math.min(2, Math.max(0, rank + (wasCorrect ? 1 : -1)))
  return nextRank === 0 ? 'easy' : nextRank === 1 ? 'medium' : 'hard'
}

