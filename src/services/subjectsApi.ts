import type { ApiSubject } from '../types/api'
import { apiGet, apiPost } from './apiClient'

export async function fetchSubjects(): Promise<ApiSubject[]> {
  return apiGet<ApiSubject[]>('/api/subjects')
}

export function createSubject(name: string, accessToken: string) {
  return apiPost<{ id: number; name: string }, { name: string }>('/api/subjects', { name }, { accessToken })
}

export function createTopic(subjectId: number, name: string, accessToken: string) {
  return apiPost<{ id: number; subjectId: number; name: string }, { subjectId: number; name: string }>(
    '/api/subjects/topics',
    { subjectId, name },
    { accessToken },
  )
}

