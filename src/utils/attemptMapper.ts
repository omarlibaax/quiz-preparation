import type { ApiAttemptResult } from '../types/api'
import type { AnswerValue, Difficulty, QuizAttempt, QuizQuestion, QuizSetup } from '../types/quiz'
import { buildAttempt } from './scoring'

function mapDifficulty(input: 'EASY' | 'MEDIUM' | 'HARD'): Difficulty {
  if (input === 'EASY') return 'easy'
  if (input === 'MEDIUM') return 'medium'
  return 'hard'
}

export function mapApiAttemptToQuizAttempt(
  apiAttempt: ApiAttemptResult,
  setup: QuizSetup,
  markedForReview: Record<string, boolean>,
): QuizAttempt {
  const questions: QuizQuestion[] = []
  const answersById: Record<string, AnswerValue> = {}

  for (const row of apiAttempt.answers) {
    const q = row.question
    const id = String(q.id)
    if (q.type === 'MCQ') {
      const correct = q.options.find((o) => o.isCorrect)?.optionText ?? ''
      const options = q.options.map((o) => o.optionText)
      questions.push({
        id,
        type: 'mcq',
        question: q.questionText,
        options,
        optionsShuffled: options,
        answer: correct,
        difficulty: mapDifficulty(q.difficulty),
        subjectName: apiAttempt.exam.subject.name,
        topicName: q.topic.name,
      })
      answersById[id] = row.selectedOption?.optionText ?? null
    } else {
      const trueOption = q.options.find((o) => o.optionText.toLowerCase() === 'true')
      const falseOption = q.options.find((o) => o.optionText.toLowerCase() === 'false')
      const answer = trueOption?.isCorrect ? true : falseOption?.isCorrect ? false : false
      questions.push({
        id,
        type: 'tf',
        question: q.questionText,
        answer,
        difficulty: mapDifficulty(q.difficulty),
        subjectName: apiAttempt.exam.subject.name,
        topicName: q.topic.name,
      })
      answersById[id] = row.selectedBoolean ?? null
    }
  }

  const finishedAt = apiAttempt.submittedAt ?? new Date().toISOString()
  return buildAttempt({
    setup,
    questions,
    answersById,
    markedForReview,
    startedAt: apiAttempt.startedAt,
    finishedAt,
  })
}

