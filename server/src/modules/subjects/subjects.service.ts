import { prisma } from '../../shared/prisma'
import { HttpError } from '../../shared/http-error'

export async function listSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: 'asc' },
    include: {
      topics: {
        orderBy: { name: 'asc' },
      },
    },
  })
}

export async function createSubject(input: { name: string }) {
  const normalized = input.name.trim()
  const exists = await prisma.subject.findUnique({ where: { name: normalized } })
  if (exists) throw new HttpError(409, 'Subject already exists')

  return prisma.subject.create({
    data: { name: normalized },
  })
}

export async function createTopic(input: { subjectId: number; name: string }) {
  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } })
  if (!subject) throw new HttpError(404, 'Subject not found')

  return prisma.topic.create({
    data: {
      subjectId: input.subjectId,
      name: input.name.trim(),
    },
  })
}

