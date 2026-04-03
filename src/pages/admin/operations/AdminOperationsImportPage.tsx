import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { importQuestionBank } from '../../../services/adminApi'

export default function AdminOperationsImportPage() {
  const { tokens } = useAuth()
  const [clearExisting, setClearExisting] = useState(false)
  const [filePath, setFilePath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runImport() {
    if (!tokens?.accessToken) return
    setIsLoading(true)
    setError(null)
    setStatus(null)
    try {
      const result = await importQuestionBank({ clearExisting, filePath: filePath.trim() || undefined }, tokens.accessToken)
      setStatus(
        `Imported ${result.questionsCreated} questions (skipped ${result.questionsSkipped}), subjects created: ${result.subjectsCreated}, topics created: ${result.topicsCreated}.`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Import data</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Import JSON question bank into MySQL.</p>
      </div>
      {status ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}
      {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/80">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={clearExisting} onChange={(e) => setClearExisting(e.target.checked)} />
          Clear existing subjects/topics/questions/exams first
        </label>
        <input
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="Optional server file path"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="button"
          onClick={runImport}
          disabled={isLoading}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? 'Importing...' : 'Run import'}
        </button>
      </section>
    </div>
  )
}
