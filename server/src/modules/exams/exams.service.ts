import { prisma } from '../../shared/prisma'
import { HttpError } from '../../shared/http-error'

export async function createExam(input: {
  title: string
  subjectId: number
  durationMinutes: number
  totalQuestions: number
  questionIds: number[]
  createdById?: number
}) {
  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } })
  if (!subject) throw new HttpError(404, 'Subject not found')

  if (input.questionIds.length < input.totalQuestions) {
    throw new HttpError(400, 'questionIds must be >= totalQuestions')
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: input.questionIds } },
    include: { topic: true },
  })
  if (questions.length !== input.questionIds.length) {
    throw new HttpError(400, 'One or more questionIds are invalid')
  }

  const invalid = questions.find((q) => q.topic.subjectId !== input.subjectId)
  if (invalid) throw new HttpError(400, 'All questions must belong to exam subject')

  const used = input.questionIds.slice(0, input.totalQuestions)

  return prisma.exam.create({
    data: {
      title: input.title,
      subjectId: input.subjectId,
      durationMinutes: input.durationMinutes,
      totalQuestions: input.totalQuestions,
      createdById: input.createdById,
      questions: {
        create: used.map((questionId, idx) => ({
          questionId,
          orderNo: idx + 1,
        })),
      },
    },
    include: {
      questions: {
        include: { question: { include: { options: true, topic: true } } },
        orderBy: { orderNo: 'asc' },
      },
      subject: true,
    },
  })
}

export async function listExams(input: { onlyPublished?: boolean }) {
  return prisma.exam.findMany({
    where: input.onlyPublished ? { isPublished: true } : undefined,
    include: {
      subject: true,
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getExamById(examId: number, onlyPublished = false) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subject: true,
      questions: {
        include: { question: { include: { options: true, topic: true } } },
        orderBy: { orderNo: 'asc' },
      },
    },
  })
  if (!exam) throw new HttpError(404, 'Exam not found')
  if (onlyPublished && !exam.isPublished) throw new HttpError(404, 'Exam not found')
  return exam
}

export async function setExamPublished(examId: number, isPublished: boolean) {
  const exists = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exists) throw new HttpError(404, 'Exam not found')
  return prisma.exam.update({
    where: { id: examId },
    data: { isPublished },
  })
}

