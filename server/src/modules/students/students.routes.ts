import { Router } from 'express'
import { requireAuth } from '../auth/auth.middleware'
import { getStudentDashboard } from './students.service'

export const studentRouter = Router()

studentRouter.get('/me/dashboard', requireAuth, async (req, res) => {
  const dashboard = await getStudentDashboard(req.auth!.userId)
  res.json(dashboard)
})

