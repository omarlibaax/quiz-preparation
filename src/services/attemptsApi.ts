import type { ApiAttemptResult, ApiStartedAttempt, ApiSubmitAttemptResult } from '../types/api'
import { apiGet, apiPost } from './apiClient'

type SubmitAnswerInput = {
  questionId: number
  selectedOptionId?: number
  selectedBoolean?: boolean
}

export function startAttempt(examId: number, accessToken: string) {
  return apiPost<ApiStartedAttempt, { examId: number }>(
    '/api/attempts/start',
    { examId },
    { accessToken },
  )
}

export function submitAttempt(
  attemptId: number,
  answers: SubmitAnswerInput[],
  accessToken: string,
) {
  return apiPost<ApiSubmitAttemptResult, { answers: SubmitAnswerInput[] }>(
    `/api/attempts/${attemptId}/submit`,
    { answers },
    { accessToken },
  )
}

export function getAttemptResult(attemptId: number, accessToken: string) {
  return apiGet<ApiAttemptResult>(`/api/attempts/${attemptId}`, { accessToken })
}

