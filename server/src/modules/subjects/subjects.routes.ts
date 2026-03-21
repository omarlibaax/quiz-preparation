import { Router } from 'express'
import { requireAuth, requireRole } from '../auth/auth.middleware'
import { createSubjectSchema, createTopicSchema } from './subjects.schemas'
import { createSubject, createTopic, listSubjects } from './subjects.service'

export const subjectRouter = Router()

subjectRouter.get('/', async (_req, res) => {
  const subjects = await listSubjects()
  res.json(subjects)
})

subjectRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res) => {
    const body = createSubjectSchema.parse(req.body)
    const subject = await createSubject(body)
    res.status(201).json(subject)
  },
)

subjectRouter.post(
  '/topics',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res) => {
    const body = createTopicSchema.parse(req.body)
    const topic = await createTopic(body)
    res.status(201).json(topic)
  },
)

