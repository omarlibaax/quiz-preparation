import { Link } from 'react-router-dom'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useThemeStore } from '../../store/themeStore'
import { cn } from '../../utils/cn'

type Props = {
  onMenu: () => void
  onToggleSidebar: () => void
  userName: string
  userSubtitle?: string
}

export function AdminHeader({ onMenu, onToggleSidebar, userName, userSubtitle = 'Administrator' }: Props) {
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const theme = useThemeStore((s) => s.theme)
  const toggleRightPanel = useAdminUiStore((s) => s.toggleRightPanel)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 lg:gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="inline-flex rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <IconMenu />
        </button>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">Welcome back,</p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
        <label htmlFor="admin-search" className="sr-only">
          Search
        </label>
        <div className="relative hidden max-w-md flex-1 md:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch />
          </span>
          <input
            id="admin-search"
            type="search"
            placeholder="Search…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#845adf] focus:outline-none focus:ring-2 focus:ring-[#845adf]/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Notifications"
          onClick={toggleRightPanel}
        >
          <IconBell />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <button
          type="button"
          className="hidden rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 xl:inline-flex"
          aria-label="App grid"
        >
          <IconGrid />
        </button>

        <div className="hidden h-9 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

        <div className="flex items-center gap-2 pl-1">
          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#845adf] to-indigo-600 text-xs font-bold text-white sm:flex">
            {userName
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userSubtitle}</p>
          </div>
        </div>

        <Link
          to="/"
          className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#845adf] hover:bg-[#845adf]/10 dark:text-[#c4b5fd] dark:hover:bg-[#845adf]/15 sm:inline-flex"
        >
          Student
        </Link>
      </div>
    </header>
  )
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}
function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}
function IconSun({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}
function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}
function IconBell({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.082A2.25 2.25 0 0 0 21 13.5v-3.364c0-1.473-1.2-2.682-2.682-2.682a2.25 2.25 0 0 0-1.884.886c-.552.494-1.256.886-2.014 1.143" />
    </svg>
  )
}
function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25A2.25 2.25 0 0 1 10.5 15.75V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25Z" />
    </svg>
  )
}
