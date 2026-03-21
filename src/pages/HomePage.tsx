import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSubjects } from '../utils/questionBank'
import SubjectIcon from '../components/SubjectIcon'
import { fetchSubjects } from '../services/subjectsApi'
import type { ApiSubject } from '../types/api'

export default function HomePage() {
  const localSubjects = useMemo(() => listSubjects(), [])
  const [subjects, setSubjects] = useState(localSubjects)
  const [usingBackend, setUsingBackend] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const apiSubjects: ApiSubject[] = await fetchSubjects()
        if (!cancelled && apiSubjects.length > 0) {
          setSubjects(
            apiSubjects.map((s) => ({
              name: s.name,
              topics: s.topics.map((t) => t.name),
            })),
          )
          setUsingBackend(true)
        }
      } catch {
        if (!cancelled) setUsingBackend(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const tileAccents = [
    { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200' },
    { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200' },
    { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200' },
  ]

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden="true" fill="none">
              <path
                d="M9.1 9a3 3 0 1 1 4.8 2.4c-.9.7-1.4 1.2-1.4 2.6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17.5" r="1" fill="currentColor" />
              <path
                d="M4.5 12a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">QuizTime</div>
            <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Quiz Time
            </h1>
            <p className="text-sm text-slate-500 sm:text-base">Choose a category to begin</p>
          </div>
        </div>
      </div>

      <section className="mt-4 space-y-4">
        <div className="rounded-[1.8rem] bg-white/70 p-4 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Choose a category</h2>
              <p className="mt-1 text-xs text-slate-500">Select a subject and set your quiz.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {subjects.map((s, idx) => {
            const acc = tileAccents[idx % tileAccents.length]
            return (
              <Link
                key={s.name}
                to={`/setup?subject=${encodeURIComponent(s.name)}`}
                className="group flex h-32 flex-col justify-between rounded-[1.8rem] border border-slate-200 bg-white/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-600">Subject</div>
                  <div
                    className={[
                      'flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
                      acc.bg,
                      acc.ring,
                      acc.text,
                    ].join(' ')}
                  >
                    <SubjectIcon subjectName={s.name} className="h-10 w-10" />
                  </div>
                </div>

                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-slate-900">{s.name}</div>
                  <div className="mt-1 text-[12px] text-slate-600 sm:text-[13px]">
                    {s.topics.length} topic{s.topics.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <footer className="mt-5 text-center text-xs text-slate-500">
        {usingBackend
          ? 'Connected to backend API for subject catalog.'
          : 'Using local JSON fallback (backend unavailable).'}
      </footer>
    </div>
  )
}

