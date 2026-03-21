import type { ApiStudentAttempt, ApiStudentDashboard } from '../types/api'
import { apiGet } from './apiClient'

export function getMyDashboard(accessToken: string) {
  return apiGet<ApiStudentDashboard>('/api/students/me/dashboard', { accessToken })
}

export function getMyAttempts(accessToken: string, limit = 50) {
  const q = new URLSearchParams({ limit: String(limit) })
  return apiGet<ApiStudentAttempt[]>(`/api/students/me/attempts?${q}`, { accessToken })
}

