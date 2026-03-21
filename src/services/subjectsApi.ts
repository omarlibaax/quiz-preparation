import type { ApiSubject } from '../types/api'
import { apiGet } from './apiClient'

export async function fetchSubjects(): Promise<ApiSubject[]> {
  return apiGet<ApiSubject[]>('/api/subjects')
}

