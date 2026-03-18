import { Link } from 'react-router-dom'
import { listSubjects } from '../utils/questionBank'

export default function HomePage() {
  const subjects = listSubjects()

  return (
    <div className="flex-1 px-4">
      <header className="mb-4">
        <div className="rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">Quiz Time</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Smart Prep</h1>
              <p className="mt-1 text-xs text-sky-100">
                Choose a category and start practicing instantly.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-4 space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Categories
          </h2>
          <span className="text-[11px] text-slate-400">{subjects.length} available</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2">
          {subjects.map((s) => (
            <Link
              key={s.name}
              to={`/setup?subject=${encodeURIComponent(s.name)}`}
              className="flex h-28 flex-col justify-between rounded-3xl bg-gradient-to-br from-quiz-blue to-sky-500 p-4 text-white shadow-md transition hover:translate-y-[1px] hover:shadow-lg"
            >
              <div className="text-xs font-semibold opacity-80">Subject</div>
              <div>
                <div className="text-base font-bold leading-tight">{s.name}</div>
                <div className="mt-1 text-[11px] text-sky-100">
                  {s.topics.length} topic{s.topics.length !== 1 ? 's' : ''}
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

