export type ApiTopic = {
  id: number
  name: string
}

export type ApiSubject = {
  id: number
  name: string
  topics: ApiTopic[]
}

export type ApiExam = {
  id: number
  title: string
  durationMinutes: number
  totalQuestions: number
  isPublished: boolean
  subject: {
    id: number
    name: string
  }
}

export type ApiStartedAttempt = {
  attemptId: number
  exam: {
    id: number
    title: string
    durationMinutes: number
    totalQuestions: number
    subjectId: number
  }
  questions: Array<{
    id: number
    type: 'MCQ' | 'TF'
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    topicName: string
    questionText: string
    options: Array<{
      id: number
      optionText: string
    }>
  }>
}

export type ApiSubmitAttemptResult = {
  attemptId: number
  examId: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  scorePercent: number
}

export type ApiAttemptResult = {
  id: number
  startedAt: string
  submittedAt: string | null
  exam: {
    id: number
    title: string
    subject: {
      id: number
      name: string
    }
  }
  answers: Array<{
    questionId: number
    selectedBoolean: boolean | null
    question: {
      id: number
      type: 'MCQ' | 'TF'
      difficulty: 'EASY' | 'MEDIUM' | 'HARD'
      questionText: string
      topic: {
        name: string
      }
      options: Array<{
        id: number
        optionText: string
        isCorrect: boolean
      }>
    }
    selectedOption: {
      id: number
      optionText: string
    } | null
    isCorrect: boolean
  }>
}

/** Row from GET /api/students/me/attempts */
export type ApiStudentAttempt = {
  attemptId: number
  examId: number
  examTitle: string
  subjectName: string
  scorePercent: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  startedAt: string
  submittedAt: string | null
}

export type ApiStudentDashboard = {
  totalAttempts: number
  averageScore: number
  weakTopics: Array<{
    topicId: number
    topicName: string
    totalQuestions: number
    accuracyPercent: number
  }>
  recentAttempts: Array<{
    attemptId: number
    examId: number
    examTitle: string
    subjectName: string
    scorePercent: number
    correctCount: number
    wrongCount: number
    skippedCount: number
    submittedAt: string | null
  }>
}

export type ApiQuestion = {
  id: number
  topicId: number
  type: 'MCQ' | 'TF'
  questionText: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  explanation?: string | null
}

/** Full row from GET /api/questions (includes topic + subject for admin picker) */
export type ApiQuestionListItem = {
  id: number
  topicId: number
  type: 'MCQ' | 'TF'
  questionText: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  topic: {
    id: number
    name: string
    subject: {
      id: number
      name: string
    }
  }
}

/** Response from POST /api/exams (minimal fields used by admin UI) */
export type ApiCreatedExam = {
  id: number
  title: string
  subjectId: number
  durationMinutes: number
  totalQuestions: number
  isPublished: boolean
}

export type ApiImportBankResult = {
  importedSubjects: number
  subjectsCreated: number
  topicsCreated: number
  questionsCreated: number
  questionsSkipped: number
}

