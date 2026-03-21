import type { ApiExam } from '../types/api'
import { apiGet } from './apiClient'

export function listPublishedExams() {
  return apiGet<ApiExam[]>('/api/exams?onlyPublished=true')
}

