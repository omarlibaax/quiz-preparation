import type { ApiQuestionListItem } from '../types/api'
import { apiGet } from './apiClient'

export type ListQuestionsParams = {
  topicId?: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  type?: 'MCQ' | 'TF'
  limit?: number
}

export function listQuestions(params: ListQuestionsParams = {}) {
  const sp = new URLSearchParams()
  if (params.topicId != null) sp.set('topicId', String(params.topicId))
  if (params.difficulty) sp.set('difficulty', params.difficulty)
  if (params.type) sp.set('type', params.type)
  sp.set('limit', String(params.limit ?? 100))
  const q = sp.toString()
  return apiGet<ApiQuestionListItem[]>(`/api/questions?${q}`)
}
