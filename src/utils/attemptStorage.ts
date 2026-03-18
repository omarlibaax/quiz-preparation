import type { QuizAttempt, QuizSetup } from '../types/quiz'
import { readJson, writeJson } from './storage'

const CURRENT_SETUP_KEY = 'currentSetup'
const LAST_ATTEMPT_KEY = 'lastAttempt'

export function readCurrentSetup(): QuizSetup | null {
  return readJson<QuizSetup | null>(CURRENT_SETUP_KEY, null)
}

export function writeLastAttempt(attempt: QuizAttempt) {
  writeJson(LAST_ATTEMPT_KEY, attempt)
}

export function readLastAttempt(): QuizAttempt | null {
  return readJson<QuizAttempt | null>(LAST_ATTEMPT_KEY, null)
}

