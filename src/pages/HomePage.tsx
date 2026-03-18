import { Link } from 'react-router-dom'
import { listSubjects } from '../utils/questionBank'
import SubjectIcon from '../components/SubjectIcon'

export default function HomePage() {
  const subjects = listSubjects()

  return (
    <div className="flex-1 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
            <span className="text-2xl font-extrabold">?</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">QuizTime</div>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">Quiz Time</h1>
            <p className="text-xs text-slate-500">Choose a category to begin</p>
          </div>
        </div>
      </div>

      <section className="mt-4 space-y-4">
        <div className="rounded-[1.5rem] bg-white/70 p-3 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Choose a category</h2>
              <p className="mt-1 text-xs text-slate-500">Select a subject and set your quiz.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {subjects.map((s, idx) => (
            <Link
              key={s.name}
              to={`/setup?subject=${encodeURIComponent(s.name)}`}
              className={[
                'flex h-28 flex-col justify-between rounded-[1.5rem] p-4 text-white shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg',
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
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold opacity-90">Subject</div>
                <div className="text-white opacity-90">
                  <SubjectIcon subjectName={s.name} />
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-base font-extrabold">{s.name}</div>
                <div className="mt-1 text-[11px] text-sky-50/90">
                  {s.topics.length} topic{s.topics.length !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-5 text-center text-xs text-slate-500">
        Runs offline from JSON + local storage (no database).
      </footer>
    </div>
  )
}

