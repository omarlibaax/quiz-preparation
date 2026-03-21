import { z } from 'zod'

export const createQuestionSchema = z.object({
  topicId: z.coerce.number().int().positive(),
  type: z.enum(['MCQ', 'TF']),
  questionText: z.string().min(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  explanation: z.string().optional(),
  options: z
    .array(
      z.object({
        optionText: z.string().min(1),
        isCorrect: z.boolean(),
      }),
    )
    .optional(),
  correctBoolean: z.boolean().optional(),
})

export const listQuestionsQuerySchema = z.object({
  topicId: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  type: z.enum(['MCQ', 'TF']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

