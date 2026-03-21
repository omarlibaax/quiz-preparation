import fs from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '../../shared/prisma'
import { HttpError } from '../../shared/http-error'
import type { Difficulty, QuestionType } from '@prisma/client'

type RawQuestion = {
  id: string
  type: 'mcq' | 'tf'
  question: string
  options?: string[]
  answer: string | boolean
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
}

type RawTopic = {
  name: string
  questions: RawQuestion[]
}

type RawSubject = {
  name: string
  topics: RawTopic[]
}

type RawBank = {
  subjects: RawSubject[]
}

function mapDifficulty(d: RawQuestion['difficulty']): Difficulty {
  if (d === 'easy') return 'EASY'
  if (d === 'medium') return 'MEDIUM'
  return 'HARD'
}

function mapType(t: RawQuestion['type']): QuestionType {
  return t === 'mcq' ? 'MCQ' : 'TF'
}

async function readBank(filePath?: string): Promise<RawBank> {
  const resolved =
    filePath && filePath.trim().length > 0
      ? path.resolve(filePath)
      : path.resolve(process.cwd(), '..', 'src', 'data', 'questions.json')

  let raw: string
  try {
    raw = await fs.readFile(resolved, 'utf-8')
  } catch {
    throw new HttpError(404, `Question bank file not found: ${resolved}`)
  }

  const parsed = JSON.parse(raw) as RawBank
  if (!parsed.subjects || !Array.isArray(parsed.subjects)) {
    throw new HttpError(400, 'Invalid question bank format')
  }
  return parsed
}

export async function importQuestionBank(input: {
  clearExisting: boolean
  filePath?: string
  adminUserId: number
}) {
  const bank = await readBank(input.filePath)

  if (input.clearExisting) {
    await prisma.$transaction(async (tx) => {
      await tx.attemptAnswer.deleteMany()
      await tx.attempt.deleteMany()
      await tx.examQuestion.deleteMany()
      await tx.exam.deleteMany()
      await tx.bookmark.deleteMany()
      await tx.questionOption.deleteMany()
      await tx.question.deleteMany()
      await tx.topic.deleteMany()
      await tx.subject.deleteMany()
    })
  }

  let subjectsCreated = 0
  let topicsCreated = 0
  let questionsCreated = 0
  let questionsSkipped = 0

  for (const s of bank.subjects) {
    const subject = await prisma.subject.upsert({
      where: { name: s.name.trim() },
      update: {},
      create: { name: s.name.trim() },
    })

    // rough created counter: count as created if no existing topics/questions yet for this subject before import.
    if (subject.createdAt.getTime() === subject.updatedAt.getTime()) {
      subjectsCreated += 1
    }

    for (const t of s.topics) {
      const topic = await prisma.topic.upsert({
        where: {
          subjectId_name: {
            subjectId: subject.id,
            name: t.name.trim(),
          },
        },
        update: {},
        create: {
          subjectId: subject.id,
          name: t.name.trim(),
        },
      })

      if (topic.createdAt.getTime() === topic.updatedAt.getTime()) {
        topicsCreated += 1
      }

      for (const q of t.questions) {
        const existing = await prisma.question.findFirst({
          where: {
            topicId: topic.id,
            questionText: q.question.trim(),
            type: mapType(q.type),
          },
          select: { id: true },
        })
        if (existing) {
          questionsSkipped += 1
          continue
        }

        if (q.type === 'mcq') {
          const options = q.options ?? []
          if (options.length < 2) {
            questionsSkipped += 1
            continue
          }
          const answerText = String(q.answer)
          const hasAnswer = options.some((o) => o === answerText)
          if (!hasAnswer) {
            questionsSkipped += 1
            continue
          }

          await prisma.question.create({
            data: {
              topicId: topic.id,
              type: 'MCQ',
              questionText: q.question.trim(),
              difficulty: mapDifficulty(q.difficulty),
              explanation: q.explanation?.trim(),
              createdById: input.adminUserId,
              options: {
                create: options.map((opt) => ({
                  optionText: opt,
                  isCorrect: opt === answerText,
                })),
              },
            },
          })
          questionsCreated += 1
          continue
        }

        const correctBool = Boolean(q.answer)
        await prisma.question.create({
          data: {
            topicId: topic.id,
            type: 'TF',
            questionText: q.question.trim(),
            difficulty: mapDifficulty(q.difficulty),
            explanation: q.explanation?.trim(),
            createdById: input.adminUserId,
            options: {
              create: [
                { optionText: 'True', isCorrect: correctBool === true },
                { optionText: 'False', isCorrect: correctBool === false },
              ],
            },
          },
        })
        questionsCreated += 1
      }
    }
  }

  return {
    importedSubjects: bank.subjects.length,
    subjectsCreated,
    topicsCreated,
    questionsCreated,
    questionsSkipped,
  }
}

