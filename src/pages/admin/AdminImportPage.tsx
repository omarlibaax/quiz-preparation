import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { importQuestionBank } from '../../services/adminApi'
import { fetchSubjects } from '../../services/subjectsApi'
import type { ApiSubject } from '../../types/api'

/**
 * Bulk import of `questions.json` into MySQL (admin API).
 */
export default function AdminImportPage() {
  const { tokens } = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [importClearExisting, setImportClearExisting] = useState(false)
  const [importFilePath, setImportFilePath] = useState('')
  const [importingBank, setImportingBank] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadSubjects() {
    try {
      const s = await fetchSubjects()
      setSubjects(s)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void loadSubjects()
  }, [])

  async function onImportQuestionBank() {
    if (!tokens?.accessToken) return
    setImportingBank(true)
    setError(null)
    try {
      const result = await importQuestionBank(
        {
          clearExisting: importClearExisting,
          filePath: importFilePath.trim() || undefined,
        },
        tokens.accessToken,
      )
      setStatus(
        `Import done: +${result.questionsCreated} questions, skipped ${result.questionsSkipped} (${result.subjectsCreated} subjects, ${result.topicsCreated} topics new)`,
      )
      await loadSubjects()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setImportingBank(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Import data</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Load the question bank JSON into the database. After import, subjects and topics appear under{' '}
          <strong>Subjects & topics</strong> and <strong>Question bank</strong>.
        </p>
        {subjects.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Current catalog: <strong>{subjects.length}</strong> subject(s) in the database.
          </p>
        ) : null}
      </div>

      {status ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {status}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Import question bank</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Loads JSON into MySQL via the API. If you leave the path empty, the server uses its default (
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">src/data/questions.json</code> relative to the
          repo). Optional path must be reachable <strong>on the server machine</strong>.
        </p>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={importClearExisting}
              onChange={(e) => setImportClearExisting(e.target.checked)}
              className="rounded border-slate-300 text-[#845adf] focus:ring-[#845adf]"
            />
            Clear existing subjects/topics/questions/exams first (destructive)
          </label>
          <input
            value={importFilePath}
            onChange={(e) => setImportFilePath(e.target.value)}
            placeholder="Server file path (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            onClick={onImportQuestionBank}
            disabled={importingBank}
            className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importingBank ? 'Importing…' : 'Run import'}
          </button>
        </div>
      </section>
    </div>
  )
}
