import toast from 'react-hot-toast'
import { useThemeStore } from '../../store/themeStore'
import { useAdminUiStore } from '../../store/adminUiStore'

export default function AdminSettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const { rightPanelOpen, setRightPanelOpen } = useAdminUiStore()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Appearance and workspace preferences.</p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setTheme(m)
                toast.success(`Theme: ${m}`)
              }}
              className={
                theme === m
                  ? 'rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
              }
            >
              {m === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Workspace</h2>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-sm text-slate-700 dark:text-slate-300">Show notifications panel (desktop)</span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            checked={rightPanelOpen}
            onChange={(e) => setRightPanelOpen(e.target.checked)}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Roles & permissions (demo)</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Fine-grained RBAC can be wired when <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">/api/admin/roles</code> exists.
        </p>
      </section>
    </div>
  )
}
