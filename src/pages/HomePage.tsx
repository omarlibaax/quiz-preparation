import { Link } from 'react-router-dom'
import { listSubjects } from '../utils/questionBank'

export default function HomePage() {
  const subjects = listSubjects()

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Grade 12</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight">Smart Quiz Preparation</h1>
          <p className="mt-2 text-sm text-slate-600">
            Pick a subject, configure your test, and get instant results with insights.
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Choose a subject</h2>
          <span className="text-xs text-slate-500">{subjects.length} available</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {subjects.map((s) => (
            <Link
              key={s.name}
              to={`/setup?subject=${encodeURIComponent(s.name)}`}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">{s.name}</div>
                  <div className="mt-1 text-xs text-slate-600">{s.topics.length} topics</div>
                </div>
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Start
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-6 text-center text-xs text-slate-500">
        Runs offline from JSON + local storage (no database).
      </footer>
    </div>
  )
}

