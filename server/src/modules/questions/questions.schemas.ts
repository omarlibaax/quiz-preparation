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

export const updateQuestionSchema = z
  .object({
    topicId: z.coerce.number().int().positive().optional(),
    type: z.enum(['MCQ', 'TF']).optional(),
    questionText: z.string().min(5).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    explanation: z.string().nullable().optional(),
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
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' })

export const listQuestionsQuerySchema = z.object({
  topicId: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  type: z.enum(['MCQ', 'TF']).optional(),
  limit: z.coerce.number().int().positive().max(500).default(100),
  skip: z.coerce.number().int().min(0).max(100_000).default(0),
})

