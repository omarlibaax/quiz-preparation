import { z } from 'zod'

export const importQuestionBankSchema = z.object({
  clearExisting: z.boolean().default(false),
  filePath: z.string().optional(),
})

