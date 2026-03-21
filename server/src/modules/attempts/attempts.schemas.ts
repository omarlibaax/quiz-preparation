import { z } from 'zod'

export const startAttemptSchema = z.object({
  examId: z.coerce.number().int().positive(),
})

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.coerce.number().int().positive(),
      selectedOptionId: z.coerce.number().int().positive().optional(),
      selectedBoolean: z.boolean().optional(),
    }),
  ),
})

