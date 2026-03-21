import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  getCanonicalPath,
  getSiteUrl,
} from '../config/siteMeta'
import { listSubjects } from '../utils/questionBank'
import SubjectIcon from '../components/SubjectIcon'
import { fetchSubjects } from '../services/subjectsApi'
import type { ApiSubject } from '../types/api'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
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

  const canonicalUrl = useMemo(() => getCanonicalPath('/'), [])
  const siteUrl = useMemo(() => getSiteUrl(), [])
  const ogImageUrl = useMemo(() => (siteUrl ? `${siteUrl}/favicon.svg` : '/favicon.svg'), [siteUrl])

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${canonicalUrl}#website`,
          url: canonicalUrl,
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          inLanguage: 'en-US',
        },
        {
          '@type': 'Organization',
          '@id': `${canonicalUrl}#organization`,
          name: SITE_NAME,
          url: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl],
  )

  const accents = [
    { ring: 'ring-violet-500/25', glow: 'from-violet-500/20 to-transparent', icon: 'from-violet-500 to-indigo-600' },
    { ring: 'ring-sky-500/25', glow: 'from-sky-500/20 to-transparent', icon: 'from-sky-500 to-cyan-600' },
    { ring: 'ring-emerald-500/25', glow: 'from-emerald-500/15 to-transparent', icon: 'from-emerald-500 to-teal-600' },
    { ring: 'ring-amber-500/25', glow: 'from-amber-500/15 to-transparent', icon: 'from-amber-500 to-orange-600' },
    { ring: 'ring-rose-500/25', glow: 'from-rose-500/15 to-transparent', icon: 'from-rose-500 to-pink-600' },
  ]

  return (
    <div className="w-full">
      <Helmet>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content={SITE_KEYWORDS} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={ogImageUrl} />

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Hero — full width, not inside a card */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 px-4 py-16 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#845adf]/20 blur-3xl dark:bg-[#845adf]/10" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
              Adaptive quizzes
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Track progress
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Master every subject,{' '}
              <span className="bg-gradient-to-r from-[#845adf] to-sky-500 bg-clip-text text-transparent">one quiz at a time</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Pick a category, configure difficulty and timing, and practice with instant feedback — full-width experience built
              for focus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link
                  to="/setup"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Start a quiz
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Get started
                </Link>
              )}
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
              >
                View dashboard
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-8 dark:border-slate-800">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subjects</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums text-slate-900 dark:text-white">{subjects.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topics</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                  {subjects.reduce((n, s) => n + s.topics.length, 0)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog</dt>
                <dd className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">{usingBackend ? 'API' : 'Local'}</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#845adf]/30 via-indigo-500/10 to-sky-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Today&apos;s focus</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Build streaks & accuracy</p>
                </div>
                <span className="rounded-xl bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Live
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {['Timed mode', 'Review mistakes', 'Topic drills'].map((label, i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                    <span className="text-xs font-bold text-[#845adf]">{90 - i * 8}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects — bento grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Choose a category</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Jump into a subject — each tile opens quiz setup.</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {usingBackend ? 'Connected to API' : 'Offline JSON catalog'}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((s, idx) => {
            const a = accents[idx % accents.length]
            return (
              <Link
                key={s.name}
                to={`/setup?subject=${encodeURIComponent(s.name)}`}
                className={[
                  'group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card transition',
                  'hover:-translate-y-1 hover:shadow-card-lg dark:border-slate-800 dark:bg-slate-900/80',
                  'ring-1',
                  a.ring,
                ].join(' ')}
              >
                <div
                  className={[
                    'pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition group-hover:opacity-100',
                    a.glow,
                  ].join(' ')}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Subject</span>
                  <div
                    className={[
                      'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                      a.icon,
                    ].join(' ')}
                  >
                    <SubjectIcon subjectName={s.name} className="h-9 w-9" />
                  </div>
                </div>
                <div className="relative mt-6">
                  <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{s.name}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">
                      {s.topics.length} topic{s.topics.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[#845adf] opacity-0 transition group-hover:opacity-100">Open →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
