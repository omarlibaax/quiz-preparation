import type { ApiStudentDashboard } from '../types/api'
import { apiGet } from './apiClient'

export function getMyDashboard(accessToken: string) {
  return apiGet<ApiStudentDashboard>('/api/students/me/dashboard', { accessToken })
}

