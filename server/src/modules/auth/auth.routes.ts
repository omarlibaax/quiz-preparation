import { Router } from 'express'
import { loginSchema, registerSchema } from './auth.schemas'
import { getMe, loginUser, registerUser } from './auth.service'
import { requireAuth } from './auth.middleware'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const body = registerSchema.parse(req.body)
  const result = await registerUser(body)
  res.status(201).json(result)
})

authRouter.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body)
  const result = await loginUser(body)
  res.json(result)
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await getMe(req.auth!.userId)
  res.json(user)
})

