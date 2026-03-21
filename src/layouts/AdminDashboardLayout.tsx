import type { ComponentType } from 'react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAdminUiStore } from '../store/adminUiStore'
import { useThemeStore } from '../store/themeStore'
import { cn } from '../utils/cn'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminRightPanel } from '../components/admin/AdminRightPanel'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  /** Only match exact path (e.g. avoid /admin/exams matching /admin/exams/builder) */
  end?: boolean
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: IconHome, end: true }],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/subjects', label: 'Subjects & topics', icon: IconFolder },
      { to: '/admin/questions', label: 'Question bank', icon: IconBank },
      { to: '/admin/import', label: 'Import data', icon: IconTool },
    ],
  },
  {
    title: 'Exams',
    items: [
      { to: '/admin/exams', label: 'All exams', icon: IconDoc, end: true },
      { to: '/admin/exams/builder', label: 'Create exam', icon: IconPlus },
    ],
  },
  {
    title: 'People',
    items: [{ to: '/admin/users', label: 'Users', icon: IconUsers }],
  },
  {
    title: 'Insights',
    items: [{ to: '/admin/analytics', label: 'Analytics', icon: IconChart }],
  },
  {
    title: 'System',
    items: [{ to: '/admin/settings', label: 'Settings', icon: IconGear }],
  },
]

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth()
  const collapsed = useAdminUiStore((s) => s.sidebarCollapsed)
  const setCollapsed = useAdminUiStore((s) => s.setSidebarCollapsed)
  const toggleSidebar = useAdminUiStore((s) => s.toggleSidebar)
  const rightPanelOpen = useAdminUiStore((s) => s.rightPanelOpen)
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const theme = useThemeStore((s) => s.theme)

  return (
    <div className="flex min-h-screen bg-admin-surface dark:bg-slate-950">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/5 bg-admin-sidebar text-slate-200 transition-all duration-200',
          collapsed ? 'w-[76px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/5 px-3',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed ? (
            <span className="truncate text-lg font-bold tracking-tight text-white" title="Admin panel">
              Quiz<span className="text-[#845adf]">Admin</span>
            </span>
          ) : (
            <span className="text-lg font-bold text-[#845adf]">Q</span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:inline-flex"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <IconChevron className={cn('h-5 w-5 transition', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
          <div>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Main</p>
            ) : null}
            <div className="space-y-0.5">
              {mainNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#845adf] text-white shadow-lg shadow-[#845adf]/25'
                        : 'text-slate-300 hover:bg-admin-sidebar-hover hover:text-white',
                      collapsed && 'justify-center px-2',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0 opacity-90" />
                  {!collapsed ? (
                    <span className="flex flex-1 items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-900">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">General</p>
            ) : null}
            <div className="space-y-0.5">
              {generalNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#845adf] text-white shadow-lg shadow-[#845adf]/25'
                        : 'text-slate-300 hover:bg-admin-sidebar-hover hover:text-white',
                      collapsed && 'justify-center px-2',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0 opacity-90" />
                  {!collapsed ? item.label : null}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className={cn('border-t border-white/5 p-2', collapsed ? 'flex flex-col items-center' : '')}>
          <button
            type="button"
            onClick={toggleTheme}
            className="mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
            title="Theme"
          >
            {theme === 'dark' ? <IconSun className="h-5 w-5 shrink-0" /> : <IconMoon className="h-5 w-5 shrink-0" />}
            {!collapsed ? <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span> : null}
          </button>
          {!collapsed ? (
            <p className="truncate px-2 pb-2 text-xs text-slate-500">{user?.email}</p>
          ) : null}
          <button
            type="button"
            onClick={() => logout()}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            {!collapsed ? 'Sign out' : '×'}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[padding] duration-200',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-64',
          rightPanelOpen ? 'xl:pr-80' : '',
        )}
      >
        <AdminHeader
          onMenu={() => setMobileOpen(true)}
          onToggleSidebar={toggleSidebar}
          userName={user?.fullName ?? 'Admin'}
          userSubtitle="Admin panel"
        />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>

      <AdminRightPanel />
    </div>
  )
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}
function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}
function IconDoc({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 18H15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 15 4.5h-4.5A2.25 2.25 0 0 0 8.25 6.75v12A2.25 2.25 0 0 0 10.5 21Z" />
    </svg>
  )
}
function IconBank({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v15.341c.97-.502 2.029-.803 3-.803 2.838 0 5.403-1.14 7.28-2.99M12 6.042A8.967 8.967 0 0 1 18 3.75c1.052 0 2.062.18 3 .512v15.341c-.97-.502-2.029-.803-3-.803-2.838 0-5.403-1.14-7.28-2.99M12 6.042v15.34" />
    </svg>
  )
}
function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}
function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}
function IconTool({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 0 0-3.586 0L2.5 8.25" />
    </svg>
  )
}
function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}
function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}
