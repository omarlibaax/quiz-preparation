import cors from 'cors'
import express from 'express'
import { authRouter } from './modules/auth/auth.routes'
import { attemptRouter } from './modules/attempts/attempts.routes'
import { examRouter } from './modules/exams/exams.routes'
import { questionRouter } from './modules/questions/questions.routes'
import { subjectRouter } from './modules/subjects/subjects.routes'
import { errorHandler } from './shared/error-handler'

export const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'exam-api' })
})

app.use('/api/auth', authRouter)
app.use('/api/subjects', subjectRouter)
app.use('/api/questions', questionRouter)
app.use('/api/exams', examRouter)
app.use('/api/attempts', attemptRouter)

app.use(errorHandler)

