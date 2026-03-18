import { Link } from 'react-router-dom'
import { listSubjects } from '../utils/questionBank'

export default function HomePage() {
  const subjects = listSubjects()

  return (
    <div className="flex-1">
      <header className="mb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
            <span className="text-xl font-bold">?</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Quiz Time</h1>
            <p className="mt-1 text-sm text-slate-500">Choose a category to begin</p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</h2>
          <span className="text-[11px] text-slate-400">{subjects.length} available</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 lg:grid-cols-4">
          {subjects.map((s, idx) => (
            <Link
              key={s.name}
              to={`/setup?subject=${encodeURIComponent(s.name)}`}
              className={[
                'flex h-28 flex-col justify-between rounded-3xl p-4 text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg',
                idx % 5 === 0
                  ? 'bg-[#3B82F6]'
                  : idx % 5 === 1
                  ? 'bg-[#F97316]'
                  : idx % 5 === 2
                  ? 'bg-[#22C55E]'
                  : idx % 5 === 3
                  ? 'bg-[#A855F7]'
                  : 'bg-[#EF4444]',
              ].join(' ')}
            >
              <div className="text-xs font-semibold opacity-90">Subject</div>
              <div>
                <div className="text-base font-bold leading-tight">{s.name}</div>
                <div className="mt-1 text-[11px] text-sky-50">
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

