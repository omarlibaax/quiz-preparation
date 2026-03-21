import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { UserRole } from '@prisma/client'
import { env } from '../../shared/env'
import { HttpError } from '../../shared/http-error'

type AccessPayload = {
  sub: string
  role: UserRole
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      userId: number
      role: UserRole
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) throw new HttpError(401, 'Missing access token')

  const token = header.slice('Bearer '.length)
  let payload: AccessPayload
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }

  req.auth = { userId: Number(payload.sub), role: payload.role }
  next()
}

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw new HttpError(401, 'Unauthorized')
    if (req.auth.role !== role) throw new HttpError(403, 'Forbidden')
    next()
  }
}

const ADMIN_PANEL_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN']

/** Full admin panel access (super admin + admin). */
export function requireAdmin() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw new HttpError(401, 'Unauthorized')
    if (!ADMIN_PANEL_ROLES.includes(req.auth.role)) throw new HttpError(403, 'Forbidden')
    next()
  }
}

