import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deleteQuestion, listQuestions } from '../../services/questionsApi'
import { createSubject, createTopic, fetchSubjects } from '../../services/subjectsApi'
import type { ApiQuestionListItem, ApiSubject } from '../../types/api'
import { AdminQuestionModal } from '../../components/admin/AdminQuestionModal'
import { EmptyState } from '../../components/admin/EmptyState'
import { Skeleton } from '../../components/admin/Skeleton'

export default function AdminQuestionsPage() {
  const { tokens } = useAuth()
  const accessToken = tokens?.accessToken ?? ''

  const [rows, setRows] = useState<ApiQuestionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [topicId, setTopicId] = useState<number | ''>('')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('')
  const [qType, setQType] = useState<'MCQ' | 'TF' | ''>('')
  const [subjects, setSubjects] = useState<ApiSubject[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const [newSubjectName, setNewSubjectName] = useState('')
  const [topicSubjectId, setTopicSubjectId] = useState<number>(0)
  const [newTopicName, setNewTopicName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listQuestions({
        topicId: topicId === '' ? undefined : Number(topicId),
        difficulty: difficulty || undefined,
        type: qType || undefined,
        limit: 500,
        skip: 0,
      })
      setRows(list)
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [topicId, difficulty, qType])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void fetchSubjects()
      .then(setSubjects)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (subjects[0]?.id && !topicSubjectId) setTopicSubjectId(subjects[0].id)
  }, [subjects, topicSubjectId])

  async function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    const name = newSubjectName.trim()
    if (name.length < 2) {
      toast.error('Subject name too short')
      return
    }
    try {
      await createSubject(name, accessToken)
      setNewSubjectName('')
      const next = await fetchSubjects()
      setSubjects(next)
      toast.success('Subject created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    const name = newTopicName.trim()
    if (name.length < 2) {
      toast.error('Topic name too short')
      return
    }
    if (!topicSubjectId) {
      toast.error('Select a subject')
      return
    }
    try {
      await createTopic(topicSubjectId, name, accessToken)
      setNewTopicName('')
      const next = await fetchSubjects()
      setSubjects(next)
      toast.success('Topic created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleDelete(id: number) {
    if (!accessToken) return
    if (!window.confirm(`Delete question #${id}? This cannot be undone.`)) return
    try {
      await deleteQuestion(id, accessToken)
      toast.success('Question deleted')
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Question bank</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Questions are stored in the database. Import a JSON bank from <strong>Import data</strong>, or add items here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (!accessToken) {
                toast.error('Not authenticated')
                return
              }
              setEditing('new')
              setModalOpen(true)
            }}
            className="inline-flex rounded-xl bg-[#845adf] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#845adf]/25 hover:opacity-95"
          >
            New question
          </button>
          <Link
            to="/admin/import"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Bulk import (JSON)
          </Link>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200/90 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 lg:grid-cols-2">
        <form onSubmit={handleCreateSubject} className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">New subject</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Mathematics"
              className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={!accessToken}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              Add subject
            </button>
          </div>
        </form>
        <form onSubmit={handleCreateTopic} className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">New topic under subject</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={topicSubjectId || ''}
              onChange={(e) => setTopicSubjectId(Number(e.target.value))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name"
              className="min-w-[160px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={!accessToken || subjects.length === 0}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              Add topic
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={topicId === '' ? '' : String(topicId)}
          onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All topics</option>
          {subjects.flatMap((s) =>
            s.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {s.name} — {t.name}
              </option>
            )),
          )}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Any difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={qType}
          onChange={(e) => setQType(e.target.value as typeof qType)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Any type</option>
          <option value="MCQ">MCQ</option>
          <option value="TF">True/False</option>
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No questions in database"
          description="Import the JSON bank from Operations, or create subjects/topics above and add questions."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50/95 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/95 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr key={q.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{q.id}</td>
                    <td className="max-w-md px-4 py-2.5 text-slate-800 dark:text-slate-200">{q.questionText}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{q.topic.subject.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{q.topic.name}</td>
                    <td className="px-4 py-2.5">{q.type}</td>
                    <td className="px-4 py-2.5">{q.difficulty}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(q.id)
                          setModalOpen(true)
                        }}
                        className="mr-2 font-semibold text-[#845adf] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(q.id)}
                        className="font-semibold text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && accessToken ? (
        <AdminQuestionModal
          open={modalOpen}
          questionId={editing}
          accessToken={accessToken}
          subjects={subjects}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          onSaved={() => void load()}
        />
      ) : null}
    </div>
  )
}
