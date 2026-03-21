import type { ApiSubject } from '../types/api'
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

