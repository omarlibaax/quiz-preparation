import { prisma } from '../../shared/prisma'
import { HttpError } from '../../shared/http-error'
import type { Difficulty, QuestionType } from '@prisma/client'

export async function createQuestion(input: {
  topicId: number
  type: QuestionType
  questionText: string
  difficulty: Difficulty
  explanation?: string
  createdById?: number
  options?: Array<{ optionText: string; isCorrect: boolean }>
  correctBoolean?: boolean
}) {
  const topic = await prisma.topic.findUnique({ where: { id: input.topicId } })
  if (!topic) throw new HttpError(404, 'Topic not found')

  if (input.type === 'MCQ') {
    if (!input.options || input.options.length < 2) {
      throw new HttpError(400, 'MCQ requires at least 2 options')
    }
    const correctCount = input.options.filter((o) => o.isCorrect).length
    if (correctCount !== 1) {
      throw new HttpError(400, 'MCQ requires exactly 1 correct option')
    }
  }

  if (input.type === 'TF' && typeof input.correctBoolean !== 'boolean') {
    throw new HttpError(400, 'TF requires correctBoolean')
  }

  return prisma.question.create({
    data: {
      topicId: input.topicId,
      type: input.type,
      questionText: input.questionText,
      difficulty: input.difficulty,
      explanation: input.explanation,
      createdById: input.createdById,
      options:
        input.type === 'MCQ'
          ? {
              create: input.options!.map((o) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              })),
            }
          : {
              create: [
                { optionText: 'True', isCorrect: input.correctBoolean === true },
                { optionText: 'False', isCorrect: input.correctBoolean === false },
              ],
            },
    },
    include: { options: true, topic: true },
  })
}

export async function listQuestions(input: {
  topicId?: number
  difficulty?: Difficulty
  type?: QuestionType
  limit: number
}) {
  return prisma.question.findMany({
    where: {
      topicId: input.topicId,
      difficulty: input.difficulty,
      type: input.type,
    },
    include: {
      options: true,
      topic: { include: { subject: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: input.limit,
  })
}

