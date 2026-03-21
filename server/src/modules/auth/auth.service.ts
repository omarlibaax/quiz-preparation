import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { User, UserRole } from '@prisma/client'
import { prisma } from '../../shared/prisma'
import { env } from '../../shared/env'
import { HttpError } from '../../shared/http-error'

type TokenPayload = {
  sub: string
  role: UserRole
}

export async function registerUser(input: {
  fullName: string
  email: string
  password: string
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  })
  if (existing) throw new HttpError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash,
      role: 'STUDENT',
    },
  })

  return buildAuthResponse(user)
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  })
  if (!user) throw new HttpError(401, 'Invalid credentials')

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) throw new HttpError(401, 'Invalid credentials')

  return buildAuthResponse(user)
}

async function buildAuthResponse(user: User) {
  const accessToken = jwt.sign(
    { sub: String(user.id), role: user.role } satisfies TokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'] },
  )

  const refreshToken = jwt.sign(
    { sub: String(user.id), role: user.role } satisfies TokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${env.JWT_REFRESH_EXPIRES_DAYS}d` as jwt.SignOptions['expiresIn'] },
  )

  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  })

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  }
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new HttpError(404, 'User not found')
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
  }
}

