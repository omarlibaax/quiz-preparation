import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerValue, Difficulty, QuizQuestion, QuizSetup } from '../types/quiz'
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

  // Adaptive mode: we generate questions progressively based on correctness.
  const poolRef = useRef<Record<Difficulty, QuizQuestion[]>>({ easy: [], medium: [], hard: [] })
  const nextDifficultyRef = useRef<Difficulty>('easy')
  const difficultyByIndexRef = useRef<Difficulty[]>([])

  const adaptiveMode = setup?.mode === 'adaptive'

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

  function submit(_reason: 'finished' | 'time') {
    if (!setup || submittedRef.current) return
    submittedRef.current = true
    const finishedAtIso = new Date().toISOString()

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
      if (remainingMs <= 0) submit('time')
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
    if (isLast) submit('finished')
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
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
          Loading quiz...
        </div>
      </div>
    )
  }

  const totalQuestions = setup.mode === 'adaptive' ? setup.numberOfQuestions : questions.length
  const progress = totalQuestions > 0 ? Math.round((Math.min(currentIndex + 1, questions.length) / totalQuestions) * 100) : 0

  const { correct, wrong, skipped } = countCorrectWrongSkipped(questions, answersById)

  return (
    <div className="flex-1 px-1 sm:px-4">
      <div className="mx-auto w-full max-w-3xl py-5 sm:py-6">
        <div className="rounded-[2rem] bg-white p-4 sm:p-5 shadow-xl ring-1 ring-slate-100/80">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {setup.subjectName}
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                Question {currentIndex + 1}
                <span className="ml-2 text-sm font-semibold text-slate-500">
                  of {totalQuestions}
                </span>
              </div>
            </div>
            <div className="text-right">
              {timeLimitSeconds != null && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                  <span>⏱</span>
                  {formatTime(timeLeftSeconds ?? 0)}
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500">
                Correct: {correct} • Wrong: {wrong} • Skipped: {skipped}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mb-4">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="text-xs font-semibold text-slate-500">
                Topic: {currentQuestion.topicName}
              </div>
              <div className="mt-2 text-base font-bold text-slate-900">
                {currentQuestion.question}
              </div>
            </div>
          </div>

          {currentQuestion.type === 'mcq' ? (
            <div className="grid gap-3">
              {currentQuestion.optionsShuffled?.map((opt) => {
                const selected = answersById[currentQuestion.id] === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswer(opt)}
                    className={[
                      'rounded-2xl px-4 py-3 text-left text-sm font-semibold ring-1 transition-all duration-200',
                      selected
                        ? 'bg-indigo-600 text-white ring-indigo-600 shadow-sm'
                        : 'bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 hover:shadow-sm',
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
                      'rounded-2xl px-4 py-3 text-sm font-bold ring-1 transition-all duration-200',
                      selected
                        ? 'bg-emerald-600 text-white ring-emerald-600 shadow-sm'
                        : 'bg-white text-slate-800 ring-slate-200 hover:bg-slate-50 hover:shadow-sm',
                    ].join(' ')}
                  >
                    {v ? 'True' : 'False'}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={toggleReview}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition',
                markedForReview[currentQuestion.id]
                  ? 'bg-[#A855F7] text-white ring-[#A855F7]'
                  : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              {markedForReview[currentQuestion.id] ? 'Marked for review' : 'Mark for review'}
            </button>

            <button
              type="button"
              onClick={() => {
                const isLast = currentIndex >= (setup.mode === 'adaptive' ? totalQuestions - 1 : questions.length - 1)
                if (setup.mode !== 'adaptive' && isLast) submit('finished')
                else goNext()
              }}
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-extrabold text-white shadow-sm"
            >
              {setup.mode === 'adaptive' ? (currentIndex >= totalQuestions - 1 ? 'Submit' : 'Next') : currentIndex >= questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-500">Questions</div>
              <div className="text-[11px] font-semibold text-slate-400">
                Answered/Review progress
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: setup.numberOfQuestions }).map((_, i) => {
                const q = questions[i]
                const answered = q ? answersById[q.id] != null : false
                const review = q ? !!markedForReview[q.id] : false
                const isActive = i === currentIndex
                const isGenerated = !!q
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!isGenerated}
                    onClick={() => goToIndex(i)}
                    className={[
                      'h-9 w-9 rounded-2xl text-sm font-bold ring-1 transition',
                      isActive ? 'bg-slate-900 text-white ring-slate-900' : '',
                      answered ? 'bg-emerald-600 text-white ring-emerald-600' : '',
                      review && !answered ? 'bg-[#A855F7] text-white ring-[#A855F7]' : '',
                      !isGenerated ? 'cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200 opacity-70' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

