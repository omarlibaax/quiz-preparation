/**
 * Central SEO / social metadata. Set `VITE_SITE_URL` in `.env` (production canonical & OG URLs).
 * Example: VITE_SITE_URL=https://yourdomain.com
 */
export const SITE_NAME = 'QuizTime'

export const SITE_TITLE = `${SITE_NAME} — Exam prep & practice quizzes`

export const SITE_DESCRIPTION =
  'Practice exams across subjects with adaptive quizzes, instant feedback, and progress tracking. Pick a topic, set difficulty, and learn smarter with QuizTime.'

export const SITE_KEYWORDS = [
  'exam preparation',
  'practice quiz',
  'online tests',
  'study app',
  'adaptive learning',
  'quiz practice',
  'test preparation',
  'QuizTime',
].join(', ')

/** Twitter / OG handle without @ */
export const SITE_TWITTER_HANDLE = 'quiztime'

/**
 * Absolute site URL for canonical & Open Graph (no trailing slash).
 * Falls back to `window.location.origin` in the browser when unset.
 */
export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export function getCanonicalPath(pathname = '/'): string {
  const base = getSiteUrl()
  if (!base) return pathname
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${path}`
}
