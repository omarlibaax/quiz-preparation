import type { ApiQuestion, ApiSubject } from '../types/api'
import { apiPost } from './apiClient'

export function createSubject(name: string, accessToken: string) {
  return apiPost<ApiSubject, { name: string }>(
    '/api/subjects',
    { name },
    { accessToken },
  )
}

export function createTopic(subjectId: number, name: string, accessToken: string) {
  return apiPost<{ id: number; subjectId: number; name: string }, { subjectId: number; name: string }>(
    '/api/subjects/topics',
    { subjectId, name },
    { accessToken },
  )
}

type CreateQuestionInput = {
  topicId: number
  type: 'MCQ' | 'TF'
  questionText: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  explanation?: string
  options?: Array<{
    optionText: string
    isCorrect: boolean
  }>
  correctBoolean?: boolean
}

export function createQuestion(input: CreateQuestionInput, accessToken: string) {
  return apiPost<ApiQuestion, CreateQuestionInput>(
    '/api/questions',
    input,
    { accessToken },
  )
}

