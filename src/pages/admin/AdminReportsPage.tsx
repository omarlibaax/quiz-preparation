import { useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { fetchSubjects } from '../../services/subjectsApi'
import { listAllExams } from '../../services/examsApi'
import { listQuestions } from '../../services/questionsApi'
import type { ApiExam, ApiQuestionListItem, ApiSubject } from '../../types/api'
import { ReportDataTable } from '../../features/reports/components/ReportDataTable'
import { ReportFiltersBar } from '../../features/reports/components/ReportFiltersBar'
import { useDebouncedValue } from '../../features/reports/hooks/useDebouncedValue'
import { buildAttemptRows, buildExamRows, buildQuestionRows, buildStudentRows } from '../../features/reports/utils/mockReportData'
import type {
  AttemptReportRow,
  ExamReportRow,
  ExportScope,
  QuestionAnalysisRow,
  ReportFilters,
  ReportType,
  SavedReportPreset,
  StudentPerformanceRow,
} from '../../features/reports/types'
import { defaultReportFilters } from '../../features/reports/types'
import { exportToCsv, exportToExcel, exportToPdf, printReportHtml } from '../../features/reports/utils/reportExport'

type ReportRow = StudentPerformanceRow | ExamReportRow | AttemptReportRow | QuestionAnalysisRow

const PRESET_KEY = 'quiz_admin_saved_reports'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function inDateRange(dateIso: string, filters: ReportFilters) {
  const ts = new Date(dateIso).getTime()
  if (filters.fromDate && ts < new Date(`${filters.fromDate}T00:00:00`).getTime()) return false
  if (filters.toDate && ts > new Date(`${filters.toDate}T23:59:59`).getTime()) return false
  return true
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<ReportType>('student')
  const [filters, setFilters] = useState<ReportFilters>(defaultReportFilters)
  const [presets, setPresets] = useState<SavedReportPreset[]>([])
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [exams, setExams] = useState<ApiExam[]>([])
  const [questions, setQuestions] = useState<ApiQuestionListItem[]>([])
  const [selectedDrillDown, setSelectedDrillDown] = useState<ReportRow | null>(null)
  const [auditLogs, setAuditLogs] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_KEY)
      if (raw) setPresets(JSON.parse(raw) as SavedReportPreset[])
    } catch {
      setPresets([])
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(PRESET_KEY, JSON.stringify(presets))
    } catch {
      // ignore
    }
  }, [presets])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const [subjectData, examData] = await Promise.all([fetchSubjects(), listAllExams()])
        setSubjects(subjectData)
        setExams(examData)
        const topicIds = subjectData.flatMap((s) => s.topics.map((t) => t.id)).slice(0, 10)
        const batches = await Promise.all(topicIds.map((topicId) => listQuestions({ topicId, limit: 80 })))
        setQuestions(batches.flat())
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const debouncedSearch = useDebouncedValue(filters.search, 350)
  const attempts = useMemo(() => buildAttemptRows(exams, subjects), [exams, subjects])
  const studentRows = useMemo(() => buildStudentRows(attempts), [attempts])
  const examRows = useMemo(() => buildExamRows(attempts, exams), [attempts, exams])
  const attemptRows = useMemo(() => attempts, [attempts])
  const questionRows = useMemo(() => buildQuestionRows(questions, attempts), [questions, attempts])

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ label: s.name, value: s.name })),
    [subjects],
  )
  const topicOptions = useMemo(() => {
    const inSubject =
      filters.subject === 'ALL' ? subjects.flatMap((s) => s.topics) : subjects.find((s) => s.name === filters.subject)?.topics ?? []
    return inSubject.map((t) => ({ label: t.name, value: t.name }))
  }, [subjects, filters.subject])
  const examOptions = useMemo(() => exams.map((e) => ({ label: e.title, value: e.title })), [exams])
  const userOptions = useMemo(() => {
    const names = Array.from(new Set(attemptRows.map((a) => a.studentName)))
    return names.map((n) => ({ label: n, value: n }))
  }, [attemptRows])

  const filteredStudents = useMemo(
    () =>
      studentRows.filter((row) => {
        if (!inDateRange(row.lastActivityDate, filters)) return false
        if (filters.user !== 'ALL' && row.studentName !== filters.user) return false
        if (filters.minScore !== '' && row.averageScore < filters.minScore) return false
        if (filters.maxScore !== '' && row.averageScore > filters.maxScore) return false
        if (debouncedSearch && !`${row.studentName} ${row.email}`.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
        return true
      }),
    [studentRows, filters, debouncedSearch],
  )
  const filteredExams = useMemo(
    () =>
      examRows.filter((row) => {
        if (!inDateRange(row.createdDate, filters)) return false
        if (filters.subject !== 'ALL' && row.subject !== filters.subject) return false
        if (filters.exam !== 'ALL' && row.examTitle !== filters.exam) return false
        if (filters.status === 'PASS' && row.passPercentage < 50) return false
        if (filters.status === 'FAIL' && row.passPercentage >= 50) return false
        if (filters.minScore !== '' && row.averageScore < filters.minScore) return false
        if (filters.maxScore !== '' && row.averageScore > filters.maxScore) return false
        if (debouncedSearch && !`${row.examTitle} ${row.subject}`.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
        return true
      }),
    [examRows, filters, debouncedSearch],
  )
  const filteredAttempts = useMemo(
    () =>
      attemptRows.filter((row) => {
        if (!inDateRange(row.attemptDate, filters)) return false
        if (filters.subject !== 'ALL' && row.subject !== filters.subject) return false
        if (filters.exam !== 'ALL' && row.examName !== filters.exam) return false
        if (filters.user !== 'ALL' && row.studentName !== filters.user) return false
        if (filters.status !== 'ALL' && row.result !== filters.status) return false
        if (filters.minScore !== '' && row.score < filters.minScore) return false
        if (filters.maxScore !== '' && row.score > filters.maxScore) return false
        if (
          debouncedSearch &&
          !`${row.studentName} ${row.examName} ${row.email}`.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
          return false
        return true
      }),
    [attemptRows, filters, debouncedSearch],
  )
  const filteredQuestions = useMemo(
    () =>
      questionRows.filter((row) => {
        if (filters.subject !== 'ALL' && row.subject !== filters.subject) return false
        if (filters.topic !== 'ALL' && row.topic !== filters.topic) return false
        if (filters.minScore !== '' && row.correctPercent < filters.minScore) return false
        if (filters.maxScore !== '' && row.correctPercent > filters.maxScore) return false
        if (
          debouncedSearch &&
          !`${row.questionText} ${row.subject} ${row.topic}`.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
          return false
        return true
      }),
    [questionRows, filters, debouncedSearch],
  )

  const studentColumns = useMemo<ColumnDef<StudentPerformanceRow>[]>(
    () => [
      { accessorKey: 'studentName', header: 'Student Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'totalExams', header: 'Total Exams' },
      { accessorKey: 'averageScore', header: 'Average Score' },
      { accessorKey: 'highestScore', header: 'Highest Score' },
      { accessorKey: 'lowestScore', header: 'Lowest Score' },
      {
        accessorKey: 'passRate',
        header: 'Pass Rate (%)',
        cell: (ctx) => {
          const value = Number(ctx.getValue())
          const tone = value >= 70 ? 'text-emerald-700' : value >= 50 ? 'text-amber-700' : 'text-rose-700'
          return <span className={tone}>{value}%</span>
        },
      },
      {
        accessorKey: 'lastActivityDate',
        header: 'Last Activity Date',
        cell: (ctx) => formatDate(String(ctx.getValue())),
      },
    ],
    [],
  )
  const examColumns = useMemo<ColumnDef<ExamReportRow>[]>(
    () => [
      { accessorKey: 'examTitle', header: 'Exam Title' },
      { accessorKey: 'subject', header: 'Subject' },
      { accessorKey: 'totalAttempts', header: 'Total Attempts' },
      { accessorKey: 'passedStudents', header: 'Passed Students' },
      { accessorKey: 'failedStudents', header: 'Failed Students' },
      { accessorKey: 'averageScore', header: 'Average Score' },
      {
        accessorKey: 'passPercentage',
        header: 'Pass Percentage',
        cell: (ctx) => {
          const value = Number(ctx.getValue())
          const tone = value >= 70 ? 'text-emerald-700' : value >= 50 ? 'text-amber-700' : 'text-rose-700'
          return <span className={tone}>{value}%</span>
        },
      },
      {
        accessorKey: 'createdDate',
        header: 'Created Date',
        cell: (ctx) => formatDate(String(ctx.getValue())),
      },
    ],
    [],
  )
  const attemptColumns = useMemo<ColumnDef<AttemptReportRow>[]>(
    () => [
      { accessorKey: 'studentName', header: 'Student Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'examName', header: 'Exam Name' },
      { accessorKey: 'subject', header: 'Subject' },
      { accessorKey: 'score', header: 'Score' },
      {
        accessorKey: 'result',
        header: 'Result',
        cell: (ctx) => {
          const value = String(ctx.getValue())
          const className =
            value === 'PASS'
              ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'
              : 'rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700'
          return <span className={className}>{value}</span>
        },
      },
      { accessorKey: 'timeTakenMinutes', header: 'Time Taken (min)' },
      {
        accessorKey: 'attemptDate',
        header: 'Attempt Date',
        cell: (ctx) => formatDate(String(ctx.getValue())),
      },
    ],
    [],
  )
  const questionColumns = useMemo<ColumnDef<QuestionAnalysisRow>[]>(
    () => [
      { accessorKey: 'questionId', header: 'Question ID' },
      {
        accessorKey: 'questionText',
        header: 'Question Text',
        cell: (ctx) => {
          const value = String(ctx.getValue())
          const short = value.length > 78 ? `${value.slice(0, 78)}...` : value
          return (
            <span title={value} className="block max-w-[420px] truncate">
              {short}
            </span>
          )
        },
      },
      { accessorKey: 'subject', header: 'Subject' },
      { accessorKey: 'topic', header: 'Topic' },
      { accessorKey: 'difficulty', header: 'Difficulty' },
      { accessorKey: 'timesAttempted', header: 'Times Attempted' },
      {
        accessorKey: 'correctPercent',
        header: 'Correct %',
        cell: (ctx) => `${ctx.getValue()}%`,
      },
      {
        accessorKey: 'incorrectPercent',
        header: 'Incorrect %',
        cell: (ctx) => `${ctx.getValue()}%`,
      },
    ],
    [],
  )

  const activeRows =
    reportType === 'student'
      ? filteredStudents
      : reportType === 'exam'
        ? filteredExams
        : reportType === 'attempt'
          ? filteredAttempts
          : filteredQuestions
  const activeColumns = (
    reportType === 'student'
      ? studentColumns
      : reportType === 'exam'
        ? examColumns
        : reportType === 'attempt'
          ? attemptColumns
          : questionColumns
  ) as ColumnDef<ReportRow>[]

  function savePreset(name: string) {
    const preset: SavedReportPreset = {
      id: crypto.randomUUID(),
      name,
      reportType,
      filters,
      createdAt: new Date().toISOString(),
    }
    setPresets((prev) => [preset, ...prev].slice(0, 20))
  }

  function exportRows(type: 'csv' | 'excel' | 'pdf', scope: ExportScope) {
    const rows = activeRows
    const selected = scope === 'current_page' ? rows.slice(0, 10) : rows
    const filename = `report_${reportType}_${scope}_${new Date().toISOString().slice(0, 10)}`
    const subtitle = `Date range: ${filters.fromDate || 'Any'} - ${filters.toDate || 'Any'} | Scope: ${scope}`

    if (type === 'csv') exportToCsv(selected, activeColumns, filename)
    if (type === 'excel') exportToExcel(selected, activeColumns, filename)
    if (type === 'pdf') exportToPdf(selected, activeColumns, filename, `Admin ${reportType} report`, subtitle)

    setAuditLogs((prev) => [`${new Date().toLocaleString()}: export ${type.toUpperCase()} (${scope})`, ...prev].slice(0, 25))
  }

  function printReport() {
    const headers = (
      reportType === 'student'
        ? studentColumns
        : reportType === 'exam'
          ? examColumns
          : reportType === 'attempt'
            ? attemptColumns
            : questionColumns
    ).map((c) => (typeof c.header === 'string' ? c.header : 'Column'))
    const rows =
      reportType === 'student'
        ? filteredStudents
            .slice(0, 50)
            .map(
              (r) =>
                `<tr><td>${r.studentName}</td><td>${r.email}</td><td>${r.totalExams}</td><td>${r.averageScore}</td><td>${r.highestScore}</td><td>${r.lowestScore}</td><td>${r.passRate}%</td><td>${formatDate(r.lastActivityDate)}</td></tr>`,
            )
            .join('')
        : reportType === 'exam'
          ? filteredExams
              .slice(0, 50)
              .map(
                (r) =>
                  `<tr><td>${r.examTitle}</td><td>${r.subject}</td><td>${r.totalAttempts}</td><td>${r.passedStudents}</td><td>${r.failedStudents}</td><td>${r.averageScore}</td><td>${r.passPercentage}%</td><td>${formatDate(r.createdDate)}</td></tr>`,
              )
              .join('')
          : reportType === 'attempt'
            ? filteredAttempts
                .slice(0, 50)
                .map(
                  (r) =>
                    `<tr><td>${r.studentName}</td><td>${r.email}</td><td>${r.examName}</td><td>${r.subject}</td><td>${r.score}</td><td>${r.result}</td><td>${r.timeTakenMinutes}</td><td>${formatDate(r.attemptDate)}</td></tr>`,
                )
                .join('')
            : filteredQuestions
                .slice(0, 50)
                .map(
                  (r) =>
                    `<tr><td>${r.questionId}</td><td>${r.questionText}</td><td>${r.subject}</td><td>${r.topic}</td><td>${r.difficulty}</td><td>${r.timesAttempted}</td><td>${r.correctPercent}%</td><td>${r.incorrectPercent}%</td></tr>`,
                )
                .join('')
    const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`
    printReportHtml({
      title:
        reportType === 'student'
          ? 'Student Performance Report'
          : reportType === 'exam'
            ? 'Exam Report'
            : reportType === 'attempt'
              ? 'Attempt-Level Report'
              : 'Question-Level Analysis',
      subtitle: `Date range: ${filters.fromDate || 'Any'} - ${filters.toDate || 'Any'}`,
      tableHtml: html,
    })
    setAuditLogs((prev) => [`${new Date().toLocaleString()}: print report`, ...prev].slice(0, 25))
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enterprise reporting module (table-first) with export, print, and drill-down.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            onChange={(e) => exportRows(e.target.value as 'csv' | 'excel' | 'pdf', 'all_filtered')}
            defaultValue=""
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="" disabled>
              Export filtered
            </option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            type="button"
            onClick={printReport}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Print (A4)
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'student', label: 'Student Performance' },
          { key: 'exam', label: 'Exam Report' },
          { key: 'attempt', label: 'Attempt-Level' },
          { key: 'question', label: 'Question Analysis' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setReportType(tab.key as ReportType)}
            className={[
              'rounded-lg px-3 py-1.5 text-sm font-semibold',
              reportType === tab.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ReportFiltersBar
        reportType={reportType}
        filters={filters}
        subjects={subjectOptions}
        topics={topicOptions}
        exams={examOptions}
        users={userOptions}
        onChange={setFilters}
        onReset={() => setFilters(defaultReportFilters)}
        presets={presets}
        onSavePreset={savePreset}
        onApplyPreset={(id) => {
          const found = presets.find((p) => p.id === id)
          if (found) setFilters(found.filters)
        }}
      />

      {reportType === 'student' ? (
        <ReportDataTable<StudentPerformanceRow>
          columns={studentColumns}
          rows={filteredStudents}
          loading={loading}
          onRowClick={(row) => setSelectedDrillDown(row)}
        />
      ) : reportType === 'exam' ? (
        <ReportDataTable<ExamReportRow>
          columns={examColumns}
          rows={filteredExams}
          loading={loading}
          onRowClick={(row) => setSelectedDrillDown(row)}
        />
      ) : reportType === 'attempt' ? (
        <ReportDataTable<AttemptReportRow>
          columns={attemptColumns}
          rows={filteredAttempts}
          loading={loading}
          onRowClick={(row) => setSelectedDrillDown(row)}
        />
      ) : reportType === 'question' ? (
        <ReportDataTable<QuestionAnalysisRow>
          columns={questionColumns}
          rows={filteredQuestions}
          loading={loading}
          onRowClick={(row) => setSelectedDrillDown(row)}
        />
      ) : (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 text-sm text-slate-600 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300">
          This report tab will be committed in the next step.
        </section>
      )}

      {selectedDrillDown ? (
        <section className="space-y-2 rounded-2xl border border-indigo-200/80 bg-indigo-50/70 p-4 text-sm dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-indigo-900 dark:text-indigo-200">Drill-down: {selectedDrillDown.id}</h2>
            <button
              type="button"
              onClick={() => setSelectedDrillDown(null)}
              className="rounded-lg border border-indigo-200 px-2 py-1 text-xs dark:border-indigo-800"
            >
              Close
            </button>
          </div>
          <pre className="overflow-auto rounded-lg bg-white/70 p-3 text-xs dark:bg-slate-900/60">{JSON.stringify(selectedDrillDown, null, 2)}</pre>
          {'questionId' in selectedDrillDown ? (
            <div className="rounded-lg border border-indigo-100 bg-white/80 p-3 dark:border-indigo-900/40 dark:bg-slate-900/50">
              <p className="mb-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">Answer Distribution</p>
              <div className="h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${selectedDrillDown.correctPercent}%` }}
                  title={`Correct ${selectedDrillDown.correctPercent}%`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Correct: {selectedDrillDown.correctPercent}% | Incorrect: {selectedDrillDown.incorrectPercent}%
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h3 className="mb-2 font-semibold">Enterprise controls</h3>
        <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 md:grid-cols-2">
          <p>Scheduled reports: Daily / Weekly configuration UI (placeholder).</p>
          <p>Email reports: Send export as attachment to stakeholders (placeholder).</p>
          <p>Role & access: Admin only (current guard), moderator restrictions (placeholder).</p>
          <p>Multi-language: i18n-ready labels (placeholder for integration).</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h3 className="mb-2 font-semibold">Audit logs</h3>
        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No report actions yet.</p>
        ) : (
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {auditLogs.map((log, idx) => (
              <li key={`${log}-${idx}`}>{log}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
