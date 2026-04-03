export type ReportStatus = 'PASS' | 'FAIL'

export type StudentPerformanceRow = {
  id: string
  studentName: string
  email: string
  totalExams: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  lastActivityDate: string
}

export type ExamReportRow = {
  id: string
  examTitle: string
  subject: string
  totalAttempts: number
  passedStudents: number
  failedStudents: number
  averageScore: number
  passPercentage: number
  createdDate: string
}

export type AttemptReportRow = {
  id: string
  studentId: string
  studentName: string
  email: string
  examId: number
  examName: string
  subject: string
  score: number
  result: ReportStatus
  timeTakenMinutes: number
  attemptDate: string
}

export type QuestionAnalysisRow = {
  id: string
  questionId: number
  questionText: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  subject: string
  topic: string
  timesAttempted: number
  correctPercent: number
  incorrectPercent: number
}

export type SavedReportPreset = {
  id: string
  name: string
  reportType: ReportType
  filters: ReportFilters
  createdAt: string
}

export type ReportType = 'student' | 'exam' | 'attempt' | 'question'

export type ReportFilters = {
  fromDate: string
  toDate: string
  subject: string
  topic: string
  exam: string
  user: string
  status: 'ALL' | ReportStatus
  minScore: number | ''
  maxScore: number | ''
  search: string
}

export const defaultReportFilters: ReportFilters = {
  fromDate: '',
  toDate: '',
  subject: 'ALL',
  topic: 'ALL',
  exam: 'ALL',
  user: 'ALL',
  status: 'ALL',
  minScore: '',
  maxScore: '',
  search: '',
}

export type ExportScope = 'current_page' | 'all_filtered' | 'all_rows'
