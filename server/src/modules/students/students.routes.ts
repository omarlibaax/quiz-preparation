import { Router } from 'express'
import { requireAuth } from '../auth/auth.middleware'
import { getStudentDashboard, listStudentAttempts } from './students.service'

export const studentRouter = Router()

studentRouter.get('/me/dashboard', requireAuth, async (req, res) => {
  const dashboard = await getStudentDashboard(req.auth!.userId)
  res.json(dashboard)
})

studentRouter.get('/me/attempts', requireAuth, async (req, res) => {
  const raw = req.query.limit
  const limit = raw != null ? Number(raw) : 50
  const attempts = await listStudentAttempts(req.auth!.userId, Number.isFinite(limit) ? limit : 50)
  res.json(attempts)
})

