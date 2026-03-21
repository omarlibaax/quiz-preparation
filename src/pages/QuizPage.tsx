import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerValue, Difficulty, QuizQuestion, QuizSetup } from '../types/quiz'
import { useAuth } from '../context/AuthContext'
import { getAttemptResult, startAttempt, submitAttempt } from '../services/attemptsApi'
import { listPublishedExams } from '../services/examsApi'
import { mapApiAttemptToQuizAttempt } from '../utils/attemptMapper'
import { buildAttempt } from '../utils/scoring'
import { generateQuiz, getPoolQuestions, pickAdaptiveNextDifficulty, recordRecentQuestionIds } from '../utils/questionBank'
import { readCurrentSetup, writeLastAttempt } from '../utils/attemptStorage'

function formatTime(seconds: number) {
  const s = Math.max(0, seconds)
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}

function countCorrectWrongSkipped(questions: QuizQuestion[], answersById: Record<string, AnswerValue>) {
  let correct = 0
  let wrong = 0
  let skipped = 0
  for (const q of questions) {
    const a = answersById[q.id] ?? null
    const answered = a !== null
    const ok = q.type === 'mcq' ? a === q.answer : a === q.answer
    if (!answered) skipped += 1
    else if (ok) correct += 1
    else wrong += 1
  }
  return { correct, wrong, skipped }
}

export default function QuizPage() {
  const navigate = useNavigate()
  const { tokens } = useAuth()

  const setup = readCurrentSetup()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!setup) navigate('/setup', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Generate quiz questions once per mount.
  const initialQuestions = useMemo<QuizQuestion[]>(() => {
    if (!setup) return []
    if (setup.mode === 'adaptive') return []
    return generateQuiz(setup)
  }, [setup])

  const [startedAtIso] = useState(() => new Date().toISOString())

  const timeLimitSeconds = setup?.timeLimitSeconds ?? null
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(timeLimitSeconds)
  const submittedRef = useRef(false)
  const [finished, setFinished] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions)

  const [answersById, setAnswersById] = useState<Record<string, AnswerValue>>(() => {
    const base: Record<string, AnswerValue> = {}
    for (const q of initialQuestions) base[q.id] = null
    return base
  })

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>(() => ({}))
  const [backendAttemptId, setBackendAttemptId] = useState<number | null>(null)
  const [backendMode, setBackendMode] = useState(false)
  const backendOptionMapRef = useRef<Record<string, Record<string, number>>>({})

  // Adaptive mode: we generate questions progressively based on correctness.
  const poolRef = useRef<Record<Difficulty, QuizQuestion[]>>({ easy: [], medium: [], hard: [] })
  const nextDifficultyRef = useRef<Difficulty>('easy')
  const difficultyByIndexRef = useRef<Difficulty[]>([])

  const adaptiveMode = setup?.mode === 'adaptive'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!setup || !tokens?.accessToken) return
      try {
        const exams = await listPublishedExams()
        const exam = setup.examId
          ? exams.find((e) => e.id === setup.examId)
          : exams.find((e) => e.subject.name.toLowerCase() === setup.subjectName.toLowerCase())
        if (!exam) return

        const started = await startAttempt(exam.id, tokens.accessToken)
        if (cancelled) return

        const mappedQuestions: QuizQuestion[] = started.questions.map((q) => {
          const difficulty = q.difficulty === 'EASY' ? 'easy' : q.difficulty === 'MEDIUM' ? 'medium' : 'hard'
          if (q.type === 'MCQ') {
            const options = q.options.map((o) => o.optionText)
            return {
              id: String(q.id),
              type: 'mcq',
              question: q.questionText,
              options,
              optionsShuffled: options,
              answer: '',
              difficulty,
              subjectName: setup.subjectName,
              topicName: q.topicName,
            }
          }
          return {
            id: String(q.id),
            type: 'tf',
            question: q.questionText,
            answer: false,
            difficulty,
            subjectName: setup.subjectName,
            topicName: q.topicName,
          }
        })

        const optionMap: Record<string, Record<string, number>> = {}
        for (const q of started.questions) {
          if (q.type !== 'MCQ') continue
          optionMap[String(q.id)] = Object.fromEntries(q.options.map((o) => [o.optionText, o.id]))
        }
        backendOptionMapRef.current = optionMap

        const seededAnswers: Record<string, AnswerValue> = {}
        for (const q of mappedQuestions) seededAnswers[q.id] = null

        setBackendAttemptId(started.attemptId)
        setBackendMode(true)
        setQuestions(mappedQuestions)
        setAnswersById(seededAnswers)
        setCurrentIndex(0)
        setTimeLeftSeconds(started.exam.durationMinutes * 60)
      } catch {
        // keep local quiz fallback
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setup, tokens?.accessToken])

  useEffect(() => {
    if (!adaptiveMode || !setup) return

    const poolAll = getPoolQuestions(setup, { ignoreDifficulty: true })
    const grouped: Record<Difficulty, QuizQuestion[]> = { easy: [], medium: [], hard: [] }
    for (const q of poolAll) grouped[q.difficulty].push(q)

    // Shuffle groups so adaptive picks feel random.
    for (const d of Object.keys(grouped) as Difficulty[]) {
      for (let i = grouped[d].length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[grouped[d][i], grouped[d][j]] = [grouped[d][j], grouped[d][i]]
      }
    }

    poolRef.current = grouped
    const startDifficulty: Difficulty = setup.difficulty === 'mixed' ? 'easy' : setup.difficulty
    nextDifficultyRef.current = startDifficulty

    const first = pickFromPools(startDifficulty)
    if (first) {
      setQuestions([first])
      setCurrentIndex(0)
      difficultyByIndexRef.current = [startDifficulty]
      setAnswersById({ [first.id]: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adaptiveMode, setup?.subjectName])

  function pickFromPools(difficulty: Difficulty): QuizQuestion | null {
    const pools = poolRef.current
    const preferred: Difficulty[] = [difficulty, 'easy', 'medium', 'hard']
    for (const d of preferred) {
      const arr = pools[d]
      if (arr.length > 0) return arr.shift() ?? null
    }
    return null
  }

  async function submit(_reason: 'finished' | 'time') {
    if (!setup || submittedRef.current) return
    submittedRef.current = true
    const finishedAtIso = new Date().toISOString()

    if (backendMode && backendAttemptId && tokens?.accessToken) {
      try {
        const payload: Array<{
          questionId: number
          selectedOptionId?: number
          selectedBoolean?: boolean
        }> = []

        for (const q of questions) {
          const raw = answersById[q.id]
          const questionId = Number(q.id)
          if (q.type === 'mcq') {
            const selectedOptionId =
              typeof raw === 'string' ? backendOptionMapRef.current[q.id]?.[raw] : undefined
            if (selectedOptionId) payload.push({ questionId, selectedOptionId })
            continue
          }
          if (typeof raw === 'boolean') payload.push({ questionId, selectedBoolean: raw })
        }

        await submitAttempt(backendAttemptId, payload, tokens.accessToken)
        const apiAttempt = await getAttemptResult(backendAttemptId, tokens.accessToken)
        const mapped = mapApiAttemptToQuizAttempt(apiAttempt, setup as QuizSetup, markedForReview)
        writeLastAttempt(mapped)
        setFinished(true)
        navigate('/result', { replace: true })
        return
      } catch {
        // fallback to local result flow
      }
    }

    const attempt = buildAttempt({
      setup: setup as QuizSetup,
      questions: fillAdaptiveToTotalIfNeeded(questions, answersById),
      answersById,
      markedForReview,
      startedAt: startedAtIso,
      finishedAt: finishedAtIso,
    })

    recordRecentQuestionIds(attempt.questions.map((q) => q.id))
    writeLastAttempt(attempt)
    setFinished(true)
    navigate('/result', { replace: true })
  }

  function fillAdaptiveToTotalIfNeeded(current: QuizQuestion[], currentAnswers: Record<string, AnswerValue>) {
    if (!setup || setup.mode !== 'adaptive') return current
    const targetTotal = setup.numberOfQuestions
    if (current.length >= targetTotal) return current

    // We assume unanswered questions are incorrect.
    const nextQuestions = [...current]
    const nextDifficultyByIndex = [...difficultyByIndexRef.current]
    let idx = current.length
    while (nextQuestions.length < targetTotal) {
      const prevIndex = idx - 1
      const prevQ = nextQuestions[prevIndex]
      const prevDifficulty = nextDifficultyByIndex[prevIndex] ?? 'easy'
      const prevAnswer = currentAnswers[prevQ.id] ?? null
      const wasCorrect =
        prevQ.type === 'mcq' ? prevAnswer === prevQ.answer : prevAnswer === prevQ.answer

      const nextDifficulty = pickAdaptiveNextDifficulty(prevDifficulty, wasCorrect)
      const nextQ = pickFromPools(nextDifficulty)
      if (!nextQ) break
      nextQuestions.push(nextQ)
      nextDifficultyByIndex.push(nextDifficulty)
      idx += 1
    }
    return nextQuestions
  }

  // Timer effect
  useEffect(() => {
    if (!setup || setup.timeLimitSeconds == null) return
    if (finished) return

    let raf = 0
    const startedMs = new Date(startedAtIso).getTime()
    const totalMs = setup.timeLimitSeconds * 1000

    const tick = () => {
      const elapsed = Date.now() - startedMs
      const remainingMs = totalMs - elapsed
      const remainingSeconds = Math.ceil(remainingMs / 1000)
      setTimeLeftSeconds(Math.max(0, remainingSeconds))
      if (remainingMs <= 0) void submit('time')
      else raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup?.timeLimitSeconds, finished])

  const currentQuestion = questions[currentIndex]

  function setAnswer(value: AnswerValue) {
    if (!currentQuestion) return
    setAnswersById((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function toggleReview() {
    if (!currentQuestion) return
    setMarkedForReview((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))
  }

  function goToIndex(nextIndex: number) {
    if (!questions[nextIndex]) return
    setCurrentIndex(nextIndex)
  }

  function goNext() {
    if (!setup || !currentQuestion) return

    if (setup.mode === 'adaptive') {
      const prevDifficulty = difficultyByIndexRef.current[currentIndex] ?? 'easy'
      const a = answersById[currentQuestion.id] ?? null
      const wasCorrect = currentQuestion.type === 'mcq' ? a === currentQuestion.answer : a === currentQuestion.answer
      const nextDifficulty = pickAdaptiveNextDifficulty(prevDifficulty, wasCorrect)
      nextDifficultyRef.current = nextDifficulty

      const alreadyGenerated = questions[currentIndex + 1]
      if (alreadyGenerated) {
        setCurrentIndex((i) => i + 1)
        return
      }

      const nextQ = pickFromPools(nextDifficulty)
      if (!nextQ) return

      setQuestions((prev) => [...prev, nextQ])
      difficultyByIndexRef.current = [...difficultyByIndexRef.current, nextDifficulty]
      setAnswersById((prev) => ({ ...prev, [nextQ.id]: null }))
      setCurrentIndex((i) => i + 1)
      return
    }

    const isLast = currentIndex >= questions.length - 1
    if (isLast) void submit('finished')
    else setCurrentIndex((i) => i + 1)
  }

  function goPrev() {
    if (currentIndex <= 0) return
    setCurrentIndex((i) => i - 1)
  }

  if (!mounted) return null
  if (!setup) return null
  if (!currentQuestion) {
    return (
      <div className="relative z-10 flex min-h-[50vh] items-center justify-center px-4 py-16">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#845adf] border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Preparing your session…</p>
          <p className="text-xs text-slate-500">Loading questions and syncing timer</p>
        </div>
      </div>
    )
  }

  const totalQuestions = setup.mode === 'adaptive' ? setup.numberOfQuestions : questions.length
  const progress = totalQuestions > 0 ? Math.round((Math.min(currentIndex + 1, questions.length) / totalQuestions) * 100) : 0

  const { correct, wrong, skipped } = countCorrectWrongSkipped(questions, answersById)

  return (
    <div className="relative z-10 pb-28">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Session overview — full-width strip, not a single “quiz box” */}
        <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#845adf]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#845adf] dark:bg-[#845adf]/20 dark:text-[#c4b5fd]">
                {setup.subjectName}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {setup.mode} mode
              </span>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">
                Question {currentIndex + 1}
                <span className="ml-2 text-sm font-semibold text-slate-500">/ {totalQuestions}</span>
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {timeLimitSeconds != null ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#845adf]/25 bg-[#845adf]/10 px-4 py-2 text-sm font-bold text-[#845adf] dark:text-[#c4b5fd]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none">
                    <path
                      d="M12 8v5l3 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {formatTime(timeLeftSeconds ?? 0)}
                </div>
              ) : null}
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {backendMode
                  ? `Answered ${Object.values(answersById).filter((v) => v !== null).length} · Skipped ${skipped}`
                  : `Correct ${correct} · Wrong ${wrong} · Skipped ${skipped}`}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#845adf] via-indigo-500 to-sky-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Question navigator */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70 sm:px-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Jump to question</span>
            <span className="text-[10px] font-semibold text-slate-400">Green = answered · Purple = review</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: setup.numberOfQuestions }).map((_, i) => {
              const q = questions[i]
              const answered = q ? answersById[q.id] != null : false
              const review = q ? !!markedForReview[q.id] : false
              const isActive = i === currentIndex
              const isGenerated = !!q
              let pill =
                'h-10 min-w-[2.5rem] shrink-0 rounded-xl text-sm font-bold ring-1 transition '
              if (!isGenerated) {
                pill += 'cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200 opacity-60'
              } else if (isActive) {
                pill += 'bg-[#845adf] text-white ring-[#845adf] shadow-md'
              } else if (answered) {
                pill += 'bg-emerald-600 text-white ring-emerald-600'
              } else if (review && !answered) {
                pill += 'bg-violet-600 text-white ring-violet-600'
              } else {
                pill +=
                  'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200'
              }
              return (
                <button key={i} type="button" disabled={!isGenerated} onClick={() => goToIndex(i)} className={pill}>
                  {i + 1}
                </button>
              )
            })}
          </div>
        </section>

        {/* Split layout: stem + answers as separate surfaces */}
        <div className="mt-6 grid gap-6 xl:grid-cols-12">
          <section className="xl:col-span-7">
            <div className="h-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Topic</p>
              <p className="mt-2 text-sm font-semibold text-[#845adf]">{currentQuestion.topicName}</p>
              <p className="mt-6 text-xl font-bold leading-relaxed text-slate-900 dark:text-white sm:text-2xl">
                {currentQuestion.question}
              </p>
            </div>
          </section>

          <section className="xl:col-span-5">
            <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                {currentQuestion.type === 'mcq' ? 'Select an answer' : 'True or false'}
              </p>
              {currentQuestion.type === 'mcq' ? (
                <div className="flex flex-col gap-3">
                  {currentQuestion.optionsShuffled?.map((opt) => {
                    const selected = answersById[currentQuestion.id] === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswer(opt)}
                        className={[
                          'rounded-xl px-4 py-4 text-left text-sm font-semibold ring-1 transition-all duration-200 sm:text-base',
                          selected
                            ? 'bg-[#845adf] text-white ring-[#845adf] shadow-lg shadow-[#845adf]/20'
                            : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-white hover:ring-[#845adf]/40 dark:bg-slate-800/80 dark:text-slate-100 dark:ring-slate-700',
                        ].join(' ')}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map((v) => {
                    const selected = answersById[currentQuestion.id] === v
                    return (
                      <button
                        key={String(v)}
                        type="button"
                        onClick={() => setAnswer(v)}
                        className={[
                          'rounded-xl px-4 py-5 text-base font-bold ring-1 transition-all duration-200',
                          selected
                            ? 'bg-emerald-600 text-white ring-emerald-600 shadow-md'
                            : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-100',
                        ].join(' ')}
                      >
                        {v ? 'True' : 'False'}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={toggleReview}
            className={[
              'rounded-xl px-4 py-2.5 text-sm font-bold ring-1 transition',
              markedForReview[currentQuestion.id]
                ? 'bg-violet-600 text-white ring-violet-600'
                : 'border border-slate-200 bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
            ].join(' ')}
          >
            {markedForReview[currentQuestion.id] ? 'Marked' : 'Mark review'}
          </button>
          <button
            type="button"
            onClick={() => {
              const isLast = currentIndex >= (setup.mode === 'adaptive' ? totalQuestions - 1 : questions.length - 1)
              if (setup.mode !== 'adaptive' && isLast) void submit('finished')
              else goNext()
            }}
            className="ml-auto rounded-xl bg-gradient-to-r from-[#845adf] to-indigo-600 px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-[#845adf]/25"
          >
            {setup.mode === 'adaptive'
              ? currentIndex >= totalQuestions - 1
                ? 'Submit'
                : 'Next'
              : currentIndex >= questions.length - 1
                ? 'Submit'
                : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

