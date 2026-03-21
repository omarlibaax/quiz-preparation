import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { HttpError } from './http-error'

/** body-parser and other middleware attach statusCode / status (e.g. invalid JSON body). */
function getClientErrorStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined
  const e = err as { statusCode?: unknown; status?: unknown }
  const code =
    typeof e.statusCode === 'number'
      ? e.statusCode
      : typeof e.status === 'number'
        ? e.status
        : undefined
  if (code !== undefined && code >= 400 && code < 500) return code
  return undefined
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: err.issues,
    })
  }

  const clientStatus = getClientErrorStatus(err)
  if (clientStatus !== undefined) {
    const message =
      err instanceof Error ? err.message : 'Bad request'
    return res.status(clientStatus).json({ message })
  }

  // eslint-disable-next-line no-console
  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
}

