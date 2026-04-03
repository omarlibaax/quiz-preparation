import type { ReportFilters, ReportType, SavedReportPreset } from '../types'

type Option = { label: string; value: string }

type Props = {
  reportType: ReportType
  filters: ReportFilters
  subjects: Option[]
  topics: Option[]
  exams: Option[]
  users: Option[]
  onChange: (next: ReportFilters) => void
  onReset: () => void
  presets: SavedReportPreset[]
  onSavePreset: (name: string) => void
  onApplyPreset: (presetId: string) => void
}

export function ReportFiltersBar({
  reportType,
  filters,
  subjects,
  topics,
  exams,
  users,
  onChange,
  onReset,
  presets,
  onSavePreset,
  onApplyPreset,
}: Props) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Filters</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const name = window.prompt('Save current filters as:')
              if (name && name.trim()) onSavePreset(name.trim())
            }}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            Save report
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          aria-label="From date"
        />
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          aria-label="To date"
        />
        <select
          value={filters.subject}
          onChange={(e) => onChange({ ...filters, subject: e.target.value, topic: 'ALL' })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="ALL">All subjects</option>
          {subjects.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.topic}
          onChange={(e) => onChange({ ...filters, topic: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="ALL">All topics</option>
          {topics.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.exam}
          onChange={(e) => onChange({ ...filters, exam: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="ALL">All exams</option>
          {exams.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.user}
          onChange={(e) => onChange({ ...filters, user: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="ALL">All users</option>
          {users.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as ReportFilters['status'] })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          disabled={reportType === 'question'}
        >
          <option value="ALL">All status</option>
          <option value="PASS">Pass</option>
          <option value="FAIL">Fail</option>
        </select>
        <input
          type="number"
          value={filters.minScore}
          onChange={(e) => onChange({ ...filters, minScore: e.target.value === '' ? '' : Number(e.target.value) })}
          placeholder="Min score"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <input
          type="number"
          value={filters.maxScore}
          onChange={(e) => onChange({ ...filters, maxScore: e.target.value === '' ? '' : Number(e.target.value) })}
          placeholder="Max score"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Inline search..."
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <select
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return
            onApplyPreset(e.target.value)
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Saved reports</option>
          {presets
            .filter((p) => p.reportType === reportType)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </div>
    </section>
  )
}
