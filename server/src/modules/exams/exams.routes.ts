import { Router } from 'express'
import { requireAuth, requireRole } from '../auth/auth.middleware'
import { createExamSchema, publishExamSchema } from './exams.schemas'
import { createExam, getExamById, listExams, setExamPublished } from './exams.service'

export const examRouter = Router()

examRouter.get('/', async (req, res) => {
  const onlyPublished = req.query.onlyPublished === 'true'
  const exams = await listExams({ onlyPublished })
  res.json(exams)
})

examRouter.get('/:id', async (req, res) => {
  const examId = Number(req.params.id)
  const onlyPublished = req.query.onlyPublished === 'true'
  const exam = await getExamById(examId, onlyPublished)
  res.json(exam)
})

examRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res) => {
    const body = createExamSchema.parse(req.body)
    const exam = await createExam({
      ...body,
      createdById: req.auth!.userId,
    })
    res.status(201).json(exam)
  },
)

examRouter.patch(
  '/:id/publish',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res) => {
    const examId = Number(req.params.id)
    const body = publishExamSchema.parse(req.body)
    const exam = await setExamPublished(examId, body.isPublished)
    res.json(exam)
  },
)

