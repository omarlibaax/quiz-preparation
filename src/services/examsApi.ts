import type { ApiExam } from '../types/api'
import { apiGet } from './apiClient'

export function listPublishedExams() {
  return apiGet<ApiExam[]>('/api/exams?onlyPublished=true')
}

export async function listPublishedExamsBySubject(subjectName: string) {
  const exams = await listPublishedExams()
  return exams.filter((e) => e.subject.name.toLowerCase() === subjectName.toLowerCase())
}

