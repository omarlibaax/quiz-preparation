import { Router } from 'express'
import { requireAdmin, requireAuth } from '../auth/auth.middleware'
import {
  createQuestionSchema,
  listQuestionsQuerySchema,
  updateQuestionSchema,
} from './questions.schemas'
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  listQuestions,
  updateQuestion,
} from './questions.service'
import { HttpError } from '../../shared/http-error'

export const questionRouter = Router()

function parseQuestionId(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw
  const id = Number(s)
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Invalid question id')
  return id
}

questionRouter.get('/', async (req, res) => {
  const query = listQuestionsQuerySchema.parse(req.query)
  const questions = await listQuestions(query)
  res.json(questions)
})

questionRouter.get('/:id', requireAuth, requireAdmin(), async (req, res) => {
  const id = parseQuestionId(req.params.id)
  const question = await getQuestionById(id)
  res.json(question)
})

questionRouter.post(
  '/',
  requireAuth,
  requireAdmin(),
  async (req, res) => {
    const body = createQuestionSchema.parse(req.body)
    const question = await createQuestion({
      ...body,
      createdById: req.auth!.userId,
    })
    res.status(201).json(question)
  },
)

questionRouter.patch(
  '/:id',
  requireAuth,
  requireAdmin(),
  async (req, res) => {
    const id = parseQuestionId(req.params.id)
    const body = updateQuestionSchema.parse(req.body)
    const question = await updateQuestion(id, body)
    res.json(question)
  },
)

questionRouter.delete('/:id', requireAuth, requireAdmin(), async (req, res) => {
  const id = parseQuestionId(req.params.id)
  await deleteQuestion(id)
  res.status(204).send()
})

