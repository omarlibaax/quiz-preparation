import { cn } from '../../utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/80',
        className,
      )}
    />
  )
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/80">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  )
}
