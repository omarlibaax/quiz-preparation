import type { ApiCreatedExam, ApiExam } from '../types/api'
import { apiGet, apiPatch, apiPost } from './apiClient'

export type CreateExamInput = {
  title: string
  subjectId: number
  durationMinutes: number
  totalQuestions: number
  questionIds: number[]
}

export function createExam(input: CreateExamInput, accessToken: string) {
  return apiPost<ApiCreatedExam, CreateExamInput>('/api/exams', input, { accessToken })
}

export function listPublishedExams() {
  return apiGet<ApiExam[]>('/api/exams?onlyPublished=true')
}

export function listAllExams() {
  return apiGet<ApiExam[]>('/api/exams')
}

export async function listPublishedExamsBySubject(subjectName: string) {
  const exams = await listPublishedExams()
  return exams.filter((e) => e.subject.name.toLowerCase() === subjectName.toLowerCase())
}

export function setExamPublished(examId: number, isPublished: boolean, accessToken: string) {
  return apiPatch<ApiExam, { isPublished: boolean }>(
    `/api/exams/${examId}/publish`,
    { isPublished },
    { accessToken },
  )
}

