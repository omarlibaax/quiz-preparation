import { Router } from 'express'
import { requireAuth, requireRole } from '../auth/auth.middleware'
import { createQuestionSchema, listQuestionsQuerySchema } from './questions.schemas'
import { createQuestion, listQuestions } from './questions.service'

export const questionRouter = Router()

questionRouter.get('/', async (req, res) => {
  const query = listQuestionsQuerySchema.parse(req.query)
  const questions = await listQuestions(query)
  res.json(questions)
})

questionRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res) => {
    const body = createQuestionSchema.parse(req.body)
    const question = await createQuestion({
      ...body,
      createdById: req.auth!.userId,
    })
    res.status(201).json(question)
  },
)

