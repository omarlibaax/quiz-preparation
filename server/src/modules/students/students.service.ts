import { prisma } from '../../shared/prisma'

export async function getStudentDashboard(userId: number) {
  const submittedAttempts = await prisma.attempt.findMany({
    where: {
      userId,
      submittedAt: { not: null },
    },
    include: {
      exam: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalAttempts = submittedAttempts.length
  const averageScore =
    totalAttempts === 0
      ? 0
      : Number(
          (
            submittedAttempts.reduce((sum, a) => sum + a.scorePercent, 0) / totalAttempts
          ).toFixed(2),
        )

  const recentAttempts = submittedAttempts.slice(0, 10).map((a) => ({
    attemptId: a.id,
    examId: a.examId,
    examTitle: a.exam.title,
    subjectName: a.exam.subject.name,
    scorePercent: a.scorePercent,
    correctCount: a.correctCount,
    wrongCount: a.wrongCount,
    skippedCount: a.skippedCount,
    submittedAt: a.submittedAt,
  }))

  const answers = await prisma.attemptAnswer.findMany({
    where: {
      attempt: {
        userId,
        submittedAt: { not: null },
      },
    },
    include: {
      question: {
        include: {
          topic: true,
        },
      },
    },
  })

  const byTopic = new Map<
    string,
    { topicId: number; topicName: string; total: number; correct: number }
  >()
  for (const a of answers) {
    const topic = a.question.topic
    const key = String(topic.id)
    const current = byTopic.get(key) ?? {
      topicId: topic.id,
      topicName: topic.name,
      total: 0,
      correct: 0,
    }
    current.total += 1
    if (a.isCorrect) current.correct += 1
    byTopic.set(key, current)
  }

  const weakTopics = [...byTopic.values()]
    .map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      totalQuestions: t.total,
      accuracyPercent: t.total === 0 ? 0 : Number(((t.correct / t.total) * 100).toFixed(2)),
    }))
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .slice(0, 5)

  return {
    totalAttempts,
    averageScore,
    weakTopics,
    recentAttempts,
  }
}

export async function listStudentAttempts(userId: number, limit = 50) {
  const take = Math.min(100, Math.max(1, limit))
  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      submittedAt: { not: null },
    },
    include: {
      exam: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
    take,
  })

  return attempts.map((a) => ({
    attemptId: a.id,
    examId: a.examId,
    examTitle: a.exam.title,
    subjectName: a.exam.subject.name,
    scorePercent: a.scorePercent,
    correctCount: a.correctCount,
    wrongCount: a.wrongCount,
    skippedCount: a.skippedCount,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
  }))
}

