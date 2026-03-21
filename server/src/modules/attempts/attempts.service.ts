import { prisma } from '../../shared/prisma'
import { HttpError } from '../../shared/http-error'

export async function startAttempt(input: { userId: number; examId: number }) {
  const exam = await prisma.exam.findUnique({
    where: { id: input.examId },
    include: {
      questions: {
        include: {
          question: {
            include: {
              options: true,
              topic: true,
            },
          },
        },
        orderBy: { orderNo: 'asc' },
      },
    },
  })
  if (!exam || !exam.isPublished) throw new HttpError(404, 'Exam not found')

  const attempt = await prisma.attempt.create({
    data: {
      userId: input.userId,
      examId: input.examId,
      startedAt: new Date(),
    },
  })

  return {
    attemptId: attempt.id,
    exam: {
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      subjectId: exam.subjectId,
    },
    questions: exam.questions.map((eq) => ({
      id: eq.question.id,
      type: eq.question.type,
      difficulty: eq.question.difficulty,
      topicName: eq.question.topic.name,
      questionText: eq.question.questionText,
      options: eq.question.options.map((o) => ({
        id: o.id,
        optionText: o.optionText,
      })),
    })),
  }
}

export async function submitAttempt(input: {
  userId: number
  attemptId: number
  answers: Array<{
    questionId: number
    selectedOptionId?: number
    selectedBoolean?: boolean
  }>
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: input.attemptId },
    include: {
      exam: {
        include: {
          questions: {
            include: { question: { include: { options: true } } },
          },
        },
      },
    },
  })
  if (!attempt) throw new HttpError(404, 'Attempt not found')
  if (attempt.userId !== input.userId) throw new HttpError(403, 'Forbidden')
  if (attempt.submittedAt) throw new HttpError(400, 'Attempt already submitted')

  const questionMap = new Map(attempt.exam.questions.map((eq) => [eq.question.id, eq.question]))
  const submittedMap = new Map(input.answers.map((a) => [a.questionId, a]))

  let correctCount = 0
  let wrongCount = 0
  let skippedCount = 0

  const createRows: Array<{
    attemptId: number
    questionId: number
    selectedOptionId?: number
    selectedBoolean?: boolean
    isCorrect: boolean
  }> = []

  for (const [, question] of questionMap) {
    const submitted = submittedMap.get(question.id)
    if (!submitted) {
      skippedCount += 1
      createRows.push({
        attemptId: attempt.id,
        questionId: question.id,
        isCorrect: false,
      })
      continue
    }

    let isCorrect = false
    if (question.type === 'MCQ') {
      const correct = question.options.find((o) => o.isCorrect)
      isCorrect = Boolean(correct && submitted.selectedOptionId === correct.id)
    } else {
      const trueOption = question.options.find((o) => o.optionText.toLowerCase() === 'true')
      const falseOption = question.options.find((o) => o.optionText.toLowerCase() === 'false')
      const expected = trueOption?.isCorrect ? true : falseOption?.isCorrect ? false : null
      isCorrect = expected !== null && submitted.selectedBoolean === expected
    }

    if (isCorrect) correctCount += 1
    else wrongCount += 1

    createRows.push({
      attemptId: attempt.id,
      questionId: question.id,
      selectedOptionId: submitted.selectedOptionId,
      selectedBoolean: submitted.selectedBoolean,
      isCorrect,
    })
  }

  await prisma.attemptAnswer.createMany({ data: createRows })

  const total = questionMap.size
  const scorePercent = total > 0 ? Number(((correctCount / total) * 100).toFixed(2)) : 0

  const updated = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      submittedAt: new Date(),
      correctCount,
      wrongCount,
      skippedCount,
      scorePercent,
    },
  })

  return {
    attemptId: updated.id,
    examId: updated.examId,
    correctCount: updated.correctCount,
    wrongCount: updated.wrongCount,
    skippedCount: updated.skippedCount,
    scorePercent: updated.scorePercent,
  }
}

export async function getAttemptResult(input: { userId: number; attemptId: number }) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: input.attemptId },
    include: {
      exam: { include: { subject: true } },
      answers: {
        include: {
          question: { include: { options: true, topic: true } },
          selectedOption: true,
        },
      },
    },
  })
  if (!attempt) throw new HttpError(404, 'Attempt not found')
  if (attempt.userId !== input.userId) throw new HttpError(403, 'Forbidden')

  return attempt
}

