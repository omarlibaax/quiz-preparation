import { Link } from 'react-router-dom'

const operationCards = [
  {
    to: '/admin/operations/subjects',
    title: 'Subjects & topics',
    description: 'Create subjects and topics separately to structure your question catalog.',
  },
  {
    to: '/admin/operations/exams',
    title: 'Exam builder',
    description: 'Build exams by selecting questions, ordering them, and publishing.',
  },
  {
    to: '/admin/operations/import',
    title: 'Import data',
    description: 'Import full question bank JSON into the database.',
  },
]

export default function AdminOperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Operations</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a dedicated operation page. Each workflow is now split into a separate section.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {operationCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/80"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Open section →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
