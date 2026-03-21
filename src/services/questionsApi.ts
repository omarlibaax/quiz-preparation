import type { ApiQuestionDetail, ApiQuestionListItem } from '../types/api'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export type ListQuestionsParams = {
  topicId?: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  type?: 'MCQ' | 'TF'
  limit?: number
  skip?: number
}

export function listQuestions(params: ListQuestionsParams = {}) {
  const sp = new URLSearchParams()
  if (params.topicId != null) sp.set('topicId', String(params.topicId))
  if (params.difficulty) sp.set('difficulty', params.difficulty)
  if (params.type) sp.set('type', params.type)
  sp.set('limit', String(params.limit ?? 200))
  if (params.skip != null) sp.set('skip', String(params.skip))
  const q = sp.toString()
  return apiGet<ApiQuestionListItem[]>(`/api/questions?${q}`)
}

export function getQuestion(id: number, accessToken: string) {
  return apiGet<ApiQuestionDetail>(`/api/questions/${id}`, { accessToken })
}

export type CreateQuestionBody = {
  topicId: number
  type: 'MCQ' | 'TF'
  questionText: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  explanation?: string
  options?: Array<{ optionText: string; isCorrect: boolean }>
  correctBoolean?: boolean
}

export function createQuestion(body: CreateQuestionBody, accessToken: string) {
  return apiPost<ApiQuestionDetail, CreateQuestionBody>('/api/questions', body, { accessToken })
}

export type UpdateQuestionBody = {
  topicId?: number
  type?: 'MCQ' | 'TF'
  questionText?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  explanation?: string | null
  options?: Array<{ optionText: string; isCorrect: boolean }>
  correctBoolean?: boolean
}

export function updateQuestion(id: number, body: UpdateQuestionBody, accessToken: string) {
  return apiPatch<ApiQuestionDetail, UpdateQuestionBody>(`/api/questions/${id}`, body, { accessToken })
}

export function deleteQuestion(id: number, accessToken: string) {
  return apiDelete(`/api/questions/${id}`, { accessToken })
}
