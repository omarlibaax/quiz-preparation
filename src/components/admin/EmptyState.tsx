import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
