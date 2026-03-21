const CIRC = 2 * Math.PI * 42

export function AdminTargetCard({
  percent = 48,
  title = 'Your target is incomplete.',
  cta = 'Click here to complete',
}: {
  percent?: number
  title?: string
  cta?: string
}) {
  const dash = (CIRC * Math.min(100, Math.max(0, percent))) / 100
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#845adf] via-[#6f48d8] to-[#4c1d95] p-6 text-white shadow-card-lg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-white/5 blur-xl" />
      <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.2)" strokeWidth="10" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="white"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
            />
          </svg>
          <span className="absolute text-xl font-bold tabular-nums">{percent}%</span>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-white/90">{title}</p>
          <button
            type="button"
            className="mt-3 inline-flex rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/25"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  )
}
