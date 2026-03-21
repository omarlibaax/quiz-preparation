import bcrypt from 'bcryptjs'
import { prisma } from '../../shared/prisma'
import { HttpError } from '../../shared/http-error'
import { env } from '../../shared/env'

export async function bootstrapAdmin(input: {
  fullName: string
  email: string
  password: string
  bootstrapSecret: string
}) {
  if (input.bootstrapSecret !== env.ADMIN_BOOTSTRAP_SECRET) {
    throw new HttpError(403, 'Invalid bootstrap secret')
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (existingAdmin) {
    throw new HttpError(409, 'Admin already exists. Use admin management instead.')
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true },
  })
  if (existingEmail) {
    throw new HttpError(409, 'Email already exists')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  }
}

