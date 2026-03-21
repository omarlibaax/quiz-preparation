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
  skip: number
}) {
  return prisma.question.findMany({
    where: {
      topicId: input.topicId,
      difficulty: input.difficulty,
      type: input.type,
    },
    include: {
      options: { orderBy: { id: 'asc' } },
      topic: { include: { subject: true } },
    },
    orderBy: { id: 'desc' },
    take: input.limit,
    skip: input.skip,
  })
}

export async function getQuestionById(id: number) {
  const q = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { id: 'asc' } },
      topic: { include: { subject: true } },
    },
  })
  if (!q) throw new HttpError(404, 'Question not found')
  return q
}

export async function updateQuestion(
  id: number,
  input: {
    topicId?: number
    type?: QuestionType
    questionText?: string
    difficulty?: Difficulty
    explanation?: string | null
    options?: Array<{ optionText: string; isCorrect: boolean }>
    correctBoolean?: boolean
  },
) {
  const q = await prisma.question.findUnique({
    where: { id },
    include: { options: { orderBy: { id: 'asc' } } },
  })
  if (!q) throw new HttpError(404, 'Question not found')

  if (input.topicId !== undefined) {
    const t = await prisma.topic.findUnique({ where: { id: input.topicId } })
    if (!t) throw new HttpError(404, 'Topic not found')
  }

  const nextType = input.type ?? q.type

  if (input.options !== undefined) {
    if (nextType !== 'MCQ') throw new HttpError(400, 'options are only valid for MCQ')
    const correctCount = input.options.filter((o) => o.isCorrect).length
    if (correctCount !== 1) throw new HttpError(400, 'MCQ requires exactly 1 correct option')
    if (input.options.length < 2) throw new HttpError(400, 'MCQ requires at least 2 options')
  }

  if (input.correctBoolean !== undefined && nextType !== 'TF') {
    throw new HttpError(400, 'correctBoolean is only valid for TF')
  }

  const typeChanged = input.type !== undefined && input.type !== q.type
  if (typeChanged) {
    if (input.type === 'MCQ' && !input.options) {
      throw new HttpError(400, 'Provide options when changing type to MCQ')
    }
    if (input.type === 'TF' && input.correctBoolean === undefined) {
      throw new HttpError(400, 'Provide correctBoolean when changing type to TF')
    }
  }

  const replaceOptions =
    typeChanged ||
    (input.options !== undefined && nextType === 'MCQ') ||
    (input.correctBoolean !== undefined && nextType === 'TF')

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id },
      data: {
        topicId: input.topicId,
        questionText: input.questionText,
        difficulty: input.difficulty,
        explanation: input.explanation === undefined ? undefined : input.explanation,
        type: input.type,
      },
    })

    if (!replaceOptions) return

    await tx.questionOption.deleteMany({ where: { questionId: id } })

    const finalType = (input.type ?? q.type) as QuestionType
    if (finalType === 'MCQ') {
      const opts = input.options
      if (!opts || opts.length < 2) {
        throw new HttpError(400, 'MCQ requires at least 2 options')
      }
      const correctCount = opts.filter((o) => o.isCorrect).length
      if (correctCount !== 1) throw new HttpError(400, 'MCQ requires exactly 1 correct option')
      await tx.questionOption.createMany({
        data: opts.map((o) => ({
          questionId: id,
          optionText: o.optionText.trim(),
          isCorrect: o.isCorrect,
        })),
      })
    } else {
      const cb =
        input.correctBoolean !== undefined
          ? input.correctBoolean
          : q.options.find((o) => o.isCorrect)?.optionText === 'True'
      await tx.questionOption.createMany({
        data: [
          { questionId: id, optionText: 'True', isCorrect: cb === true },
          { questionId: id, optionText: 'False', isCorrect: cb === false },
        ],
      })
    }
  })

  return getQuestionById(id)
}

export async function deleteQuestion(id: number) {
  const existing = await prisma.question.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw new HttpError(404, 'Question not found')
  await prisma.question.delete({ where: { id } })
}

