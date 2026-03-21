import { z } from 'zod'

export const createSubjectSchema = z.object({
  name: z.string().min(2),
})

export const createTopicSchema = z.object({
  subjectId: z.coerce.number().int().positive(),
  name: z.string().min(2),
})

