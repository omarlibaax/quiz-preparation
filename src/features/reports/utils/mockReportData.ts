import type { ApiExam, ApiQuestionListItem, ApiSubject } from '../../../types/api'
import { mockUsers } from '../../../data/adminDashboardMock'
import type {
  AttemptReportRow,
  ExamReportRow,
  QuestionAnalysisRow,
  StudentPerformanceRow,
} from '../types'

function seededScore(seed: number) {
  const x = Math.sin(seed) * 10000
  return Math.floor((x - Math.floor(x)) * 100)
}

export function buildAttemptRows(exams: ApiExam[], subjects: ApiSubject[]): AttemptReportRow[] {
  const students = mockUsers.filter((u) => u.role === 'STUDENT')
  const safeExams = exams.slice(0, 12)
  const rows: AttemptReportRow[] = []
  let id = 1

  students.forEach((student, si) => {
    safeExams.forEach((exam, ei) => {
      const attempts = (si + ei) % 2 === 0 ? 2 : 1
      for (let k = 0; k < attempts; k += 1) {
        const score = Math.max(30, seededScore((si + 1) * 97 + (ei + 3) * 31 + k * 11))
        const date = new Date(Date.now() - (si * 13 + ei * 7 + k * 5) * 24 * 60 * 60 * 1000)
        rows.push({
          id: `att-${id++}`,
          studentId: student.id,
          studentName: student.name,
          email: student.email,
          examId: exam.id,
          examName: exam.title,
          subject: exam.subject.name,
          score,
          result: score >= 50 ? 'PASS' : 'FAIL',
          timeTakenMinutes: 8 + ((si + ei + k) % 35),
          attemptDate: date.toISOString(),
        })
      }
    })
  })

  if (rows.length === 0 && subjects.length > 0) {
    return [
      {
        id: 'att-fallback',
        studentId: '1',
        studentName: 'Amina Hassan',
        email: 'amina@school.edu',
        examId: 1,
        examName: `${subjects[0].name} Demo Exam`,
        subject: subjects[0].name,
        score: 74,
        result: 'PASS',
        timeTakenMinutes: 18,
        attemptDate: new Date().toISOString(),
      },
    ]
  }

  return rows
}

export function buildStudentRows(attempts: AttemptReportRow[]): StudentPerformanceRow[] {
  const byUser = new Map<string, AttemptReportRow[]>()
  attempts.forEach((a) => {
    const key = a.studentId
    const current = byUser.get(key) ?? []
    current.push(a)
    byUser.set(key, current)
  })

  return Array.from(byUser.entries()).map(([studentId, rows]) => {
    const scores = rows.map((r) => r.score)
    const total = rows.length
    const passCount = rows.filter((r) => r.result === 'PASS').length
    const average = scores.reduce((sum, s) => sum + s, 0) / Math.max(total, 1)
    const latest = rows
      .map((r) => new Date(r.attemptDate).getTime())
      .sort((a, b) => b - a)[0]

    return {
      id: `sp-${studentId}`,
      studentName: rows[0].studentName,
      email: rows[0].email,
      totalExams: total,
      averageScore: Number(average.toFixed(1)),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: Number(((passCount / Math.max(total, 1)) * 100).toFixed(1)),
      lastActivityDate: new Date(latest).toISOString(),
    }
  })
}

export function buildExamRows(attempts: AttemptReportRow[], exams: ApiExam[]): ExamReportRow[] {
  return exams.map((exam) => {
    const rows = attempts.filter((r) => r.examId === exam.id)
    const passed = rows.filter((r) => r.result === 'PASS').length
    const failed = rows.filter((r) => r.result === 'FAIL').length
    const avg = rows.reduce((sum, r) => sum + r.score, 0) / Math.max(rows.length, 1)
    return {
      id: `er-${exam.id}`,
      examTitle: exam.title,
      subject: exam.subject.name,
      totalAttempts: rows.length,
      passedStudents: passed,
      failedStudents: failed,
      averageScore: Number(avg.toFixed(1)),
      passPercentage: Number(((passed / Math.max(rows.length, 1)) * 100).toFixed(1)),
      createdDate: new Date(Date.now() - exam.id * 86400000).toISOString(),
    }
  })
}

export function buildQuestionRows(questions: ApiQuestionListItem[], attempts: AttemptReportRow[]): QuestionAnalysisRow[] {
  return questions.slice(0, 250).map((q, i) => {
    const timesAttempted = Math.max(8, ((q.id + i + attempts.length) % 90) + 5)
    const correct = Math.min(96, Math.max(22, (q.id * 13) % 100))
    return {
      id: `qr-${q.id}`,
      questionId: q.id,
      questionText: q.questionText,
      difficulty: q.difficulty,
      subject: q.topic.subject.name,
      topic: q.topic.name,
      timesAttempted,
      correctPercent: correct,
      incorrectPercent: 100 - correct,
    }
  })
}
