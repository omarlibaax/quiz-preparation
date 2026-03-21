import { Router } from 'express'
import { requireAuth } from '../auth/auth.middleware'
import { startAttemptSchema, submitAttemptSchema } from './attempts.schemas'
import { getAttemptResult, startAttempt, submitAttempt } from './attempts.service'

export const attemptRouter = Router()

attemptRouter.post('/start', requireAuth, async (req, res) => {
  const body = startAttemptSchema.parse(req.body)
  const attempt = await startAttempt({
    userId: req.auth!.userId,
    examId: body.examId,
  })
  res.status(201).json(attempt)
})

attemptRouter.post('/:attemptId/submit', requireAuth, async (req, res) => {
  const attemptId = Number(req.params.attemptId)
  const body = submitAttemptSchema.parse(req.body)
  const result = await submitAttempt({
    userId: req.auth!.userId,
    attemptId,
    answers: body.answers,
  })
  res.json(result)
})

attemptRouter.get('/:attemptId', requireAuth, async (req, res) => {
  const attemptId = Number(req.params.attemptId)
  const result = await getAttemptResult({
    userId: req.auth!.userId,
    attemptId,
  })
  res.json(result)
})

