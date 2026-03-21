import { useAdminUiStore } from '../../store/adminUiStore'
import { mockNotifications } from '../../data/adminDashboardMock'
import { cn } from '../../utils/cn'

export function AdminRightPanel() {
  const open = useAdminUiStore((s) => s.rightPanelOpen)
  const toggle = useAdminUiStore((s) => s.toggleRightPanel)

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#845adf] text-white shadow-lg shadow-[#845adf]/30 transition hover:bg-[#6f48d8] xl:hidden',
        )}
        aria-label="Notifications"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.082A2.25 2.25 0 0 0 21 13.5v-3.364c0-1.473-1.2-2.682-2.682-2.682a2.25 2.25 0 0 0-1.884.886c-.552.494-1.256.886-2.014 1.143" />
        </svg>
      </button>

      <aside
        className={cn(
          'fixed right-0 top-0 z-20 hidden h-screen w-80 flex-col border-l border-slate-200/80 bg-white shadow-xl transition-transform dark:border-slate-800 dark:bg-slate-900 xl:flex',
          !open && 'xl:translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {mockNotifications.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{n.body}</p>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">{n.time}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
