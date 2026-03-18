export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'mcq' | 'tf'

export type MCQQuestion = {
  id: string
  type: 'mcq'
  question: string
  options: string[]
  answer: string
  difficulty: Difficulty
  explanation?: string
}

export type TFQuestion = {
  id: string
  type: 'tf'
  question: string
  answer: boolean
  difficulty: Difficulty
  explanation?: string
}

export type Question = MCQQuestion | TFQuestion

export type Topic = {
  name: string
  questions: Question[]
}

export type Subject = {
  name: string
  topics: Topic[]
}

export type QuestionBank = {
  subjects: Subject[]
}

export type QuizMode = 'practice' | 'timed' | 'adaptive'
export type AudienceMode = 'children' | 'general'

export type QuizSetup = {
  subjectName: string
  topicName?: string
  audienceMode?: AudienceMode
  numberOfQuestions: number
  timeLimitSeconds: number | null
  difficulty: Difficulty | 'mixed'
  questionType: QuestionType | 'mixed'
  mode: QuizMode
}

export type QuizQuestion = Question & {
  subjectName: string
  topicName: string
  optionsShuffled?: string[]
}

export type AnswerValue = string | boolean | null

export type QuizAttempt = {
  id: string
  createdAt: string
  setup: QuizSetup
  questions: QuizQuestion[]
  answersById: Record<string, AnswerValue>
  markedForReview: Record<string, boolean>
  startedAt: string
  finishedAt: string
  timeTakenSeconds: number
  score: {
    correct: number
    total: number
    percent: number
  }
  perTopic: Array<{
    topicName: string
    correct: number
    total: number
    percent: number
  }>
}

