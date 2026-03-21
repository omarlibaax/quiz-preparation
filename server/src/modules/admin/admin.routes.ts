import { Router } from 'express'
import { requireAuth, requireRole } from '../auth/auth.middleware'
import { importQuestionBankSchema } from './admin.schemas'
import { importQuestionBank } from './admin.service'

export const adminRouter = Router()

adminRouter.post(
  '/import-question-bank',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res) => {
    const body = importQuestionBankSchema.parse(req.body)
    const result = await importQuestionBank({
      clearExisting: body.clearExisting,
      filePath: body.filePath,
      adminUserId: req.auth!.userId,
    })
    res.json(result)
  },
)

