import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { AdminSparkline } from './AdminSparkline'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { label: string; positive?: boolean }
  sparkline?: number[]
  className?: string
}

export function KpiStatCard({ title, value, subtitle, icon, trend, sparkline, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card transition hover:shadow-card-lg dark:border-slate-700/80 dark:bg-slate-900',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
          {trend ? (
            <p
              className={cn(
                'mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                trend.positive !== false
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
              )}
            >
              {trend.label}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {icon ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#845adf]/10 text-[#845adf] dark:bg-[#845adf]/20 dark:text-[#c4b5fd]">
              {icon}
            </div>
          ) : null}
          {sparkline && sparkline.length > 0 ? (
            <div className="h-10 w-[7.25rem]">
              <AdminSparkline values={sparkline} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
