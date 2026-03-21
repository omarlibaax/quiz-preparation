import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { ApiSubject } from '../../types/api'
import type { CreateQuestionBody, UpdateQuestionBody } from '../../services/questionsApi'
import { createQuestion, getQuestion, updateQuestion } from '../../services/questionsApi'
import { cn } from '../../utils/cn'

type Props = {
  open: boolean
  questionId: number | 'new' | null
  accessToken: string
  subjects: ApiSubject[]
  onClose: () => void
  onSaved: () => void
}

const emptyMcq = ['', '', '', '']

export function AdminQuestionModal({ open, questionId, accessToken, subjects, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [topicId, setTopicId] = useState<number>(subjects[0]?.topics[0]?.id ?? 0)
  const [type, setType] = useState<'MCQ' | 'TF'>('MCQ')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [questionText, setQuestionText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [mcqOptions, setMcqOptions] = useState<string[]>(emptyMcq)
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0)
  const [tfCorrect, setTfCorrect] = useState(true)

  useEffect(() => {
    if (!open) return
    if (questionId === 'new') {
      setTopicId(subjects[0]?.topics[0]?.id ?? 0)
      setType('MCQ')
      setDifficulty('MEDIUM')
      setQuestionText('')
      setExplanation('')
      setMcqOptions([...emptyMcq])
      setMcqCorrectIndex(0)
      setTfCorrect(true)
      return
    }
    if (typeof questionId !== 'number') return

    let cancelled = false
    setLoading(true)
    void getQuestion(questionId, accessToken)
      .then((q) => {
        if (cancelled) return
        setTopicId(q.topicId)
        setType(q.type)
        setDifficulty(q.difficulty)
        setQuestionText(q.questionText)
        setExplanation(q.explanation ?? '')
        if (q.type === 'MCQ' && q.options?.length) {
          const opts = q.options.map((o) => o.optionText)
          while (opts.length < 4) opts.push('')
          setMcqOptions(opts.slice(0, 4))
          const correctIdx = q.options.findIndex((o) => o.isCorrect)
          setMcqCorrectIndex(correctIdx >= 0 ? correctIdx : 0)
        } else {
          setMcqOptions([...emptyMcq])
          setMcqCorrectIndex(0)
        }
        if (q.type === 'TF' && q.options?.length) {
          const t = q.options.find((o) => o.isCorrect)?.optionText === 'True'
          setTfCorrect(t)
        }
      })
      .catch(() => toast.error('Failed to load question'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, questionId, accessToken, subjects])

  function buildMcqPayload(): { optionText: string; isCorrect: boolean }[] | null {
    const nonEmpty = mcqOptions
      .map((optionText, i) => ({ optionText: optionText.trim(), i }))
      .filter((o) => o.optionText.length > 0)
    if (nonEmpty.length < 2) {
      toast.error('MCQ needs at least 2 non-empty options')
      return null
    }
    if (!mcqOptions[mcqCorrectIndex]?.trim()) {
      toast.error('The selected correct option must not be empty')
      return null
    }
    return mcqOptions.map((optionText, i) => ({
      optionText: optionText.trim(),
      isCorrect: i === mcqCorrectIndex,
    })).filter((o) => o.optionText.length > 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topicId) {
      toast.error('Select a topic (add a subject/topic if the list is empty)')
      return
    }
    const text = questionText.trim()
    if (text.length < 5) {
      toast.error('Question text must be at least 5 characters')
      return
    }

    setLoading(true)
    try {
      if (questionId === 'new') {
        const body: CreateQuestionBody = {
          topicId,
          type,
          questionText: text,
          difficulty,
          explanation: explanation.trim() || undefined,
        }
        if (type === 'MCQ') {
          const opts = buildMcqPayload()
          if (!opts) {
            setLoading(false)
            return
          }
          const correct = opts.filter((o) => o.isCorrect).length
          if (correct !== 1) {
            toast.error('Exactly one option must be marked correct')
            setLoading(false)
            return
          }
          body.options = opts
        } else {
          body.correctBoolean = tfCorrect
        }
        await createQuestion(body, accessToken)
        toast.success('Question created')
      } else if (typeof questionId === 'number') {
        const body: UpdateQuestionBody = {
          topicId,
          type,
          questionText: text,
          difficulty,
          explanation: explanation.trim() === '' ? null : explanation.trim(),
        }
        if (type === 'MCQ') {
          const opts = buildMcqPayload()
          if (!opts) {
            setLoading(false)
            return
          }
          body.options = opts
        } else {
          body.correctBoolean = tfCorrect
        }
        await updateQuestion(questionId, body, accessToken)
        toast.success('Question updated')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {questionId === 'new' ? 'New question' : 'Edit question'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {loading && questionId !== 'new' && !questionText ? (
          <p className="mt-6 text-sm text-slate-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Topic</label>
              <select
                value={topicId || ''}
                onChange={(e) => setTopicId(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {subjects.flatMap((s) =>
                  s.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {s.name} — {t.name}
                    </option>
                  )),
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'MCQ' | 'TF')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="TF">True / False</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Question</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Enter the question…"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Explanation (optional)</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {type === 'MCQ' ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Options (min 2)</p>
                {mcqOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={mcqCorrectIndex === idx}
                      onChange={() => setMcqCorrectIndex(idx)}
                      className="shrink-0"
                      title="Correct answer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...mcqOptions]
                        next[idx] = e.target.value
                        setMcqOptions(next)
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={tfCorrect} onChange={(e) => setTfCorrect(e.target.checked)} />
                Correct answer is True
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg',
                  'bg-[#845adf] shadow-[#845adf]/25 hover:opacity-95 disabled:opacity-50',
                )}
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
