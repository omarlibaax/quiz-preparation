import { z } from 'zod'

export const bootstrapAdminSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  bootstrapSecret: z.string().min(8),
})

