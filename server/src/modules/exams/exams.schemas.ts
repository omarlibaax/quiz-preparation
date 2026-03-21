import { z } from 'zod'

export const createExamSchema = z.object({
  title: z.string().min(3),
  subjectId: z.coerce.number().int().positive(),
  durationMinutes: z.coerce.number().int().positive(),
  totalQuestions: z.coerce.number().int().positive().max(300),
  questionIds: z.array(z.coerce.number().int().positive()).min(1),
})

export const publishExamSchema = z.object({
  isPublished: z.boolean(),
})

