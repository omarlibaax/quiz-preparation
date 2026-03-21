import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { listAllExams } from '../../services/examsApi'
import { AdminTargetCard } from '../../components/admin/AdminTargetCard'
import { KpiStatCard } from '../../components/admin/KpiStatCard'
import { KpiSkeleton } from '../../components/admin/Skeleton'
import {
  dealStatusSegments,
  examActivity,
  kpiSparklines,
  leadsBySource,
  mockActivity,
  mockUsers,
  performanceTrend,
  profitByDay,
  revenueAnalytics,
  topDeals,
} from '../../data/adminDashboardMock'

const CHART_COLORS = {
  primary: '#845adf',
  cyan: '#23b7e5',
  amber: '#f5b849',
}

export default function AdminDashboardHome() {
  const { user, tokens } = useAuth()
  const [examCount, setExamCount] = useState<number | null>(null)
  const [loadingKpi, setLoadingKpi] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!tokens?.accessToken) {
        setLoadingKpi(false)
        return
      }
      try {
        const exams = await listAllExams()
        if (!cancelled) setExamCount(exams.length)
      } catch {
        if (!cancelled) setExamCount(null)
      } finally {
        if (!cancelled) setLoadingKpi(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tokens?.accessToken])

  const leadsTotal = useMemo(() => leadsBySource.reduce((s, x) => s + x.value, 0), [])

  const statusTotal = useMemo(() => dealStatusSegments.reduce((s, x) => s + x.count, 0), [])

  const kpisRow = loadingKpi ? (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <KpiSkeleton key={i} />
      ))}
    </div>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiStatCard
        title="Total customers"
        value="56,562"
        subtitle="Active accounts"
        trend={{ label: '+25% this month', positive: true }}
        sparkline={[...kpiSparklines.customers]}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
          </svg>
        }
      />
      <KpiStatCard
        title="Total revenue"
        value="$128.4k"
        subtitle="Subscriptions + exams"
        trend={{ label: '+18% vs last month', positive: true }}
        sparkline={[...kpiSparklines.revenue]}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.879c1.171 1.025 3.071 1.025 4.242 0 1.172-1.025 1.172-2.687 0-3.712l1.293-1.293a4.5 4.5 0 0 0-6.364-6.364L7.5 5.687" />
          </svg>
        }
      />
      <KpiStatCard
        title="Exams in system"
        value={examCount ?? '—'}
        subtitle="Live from API"
        trend={{ label: '+4% new', positive: true }}
        sparkline={[...kpiSparklines.deals]}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        }
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.fullName ?? 'Admin'}!
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Track engagement, exams, and platform health — demo analytics plus live exam count.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-[#845adf] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#845adf]/25 transition hover:bg-[#6f48d8]"
            onClick={() => toast.success('Filters (demo)')}
          >
            Filters
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => toast.success('Export started (demo)')}
          >
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:items-stretch">
        <div className="xl:col-span-3">
          <AdminTargetCard percent={48} title="Your target is incomplete." cta="Click here to complete" />
        </div>
        <div className="xl:col-span-9">{kpisRow}</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900 xl:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Top deals</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Live
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {topDeals.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#845adf] to-indigo-600 text-xs font-bold text-white">
                  {d.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{d.email}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#845adf]">{d.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900 xl:col-span-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Revenue analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sales, revenue & profit (demo)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueAnalytics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-slate-500" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)' }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Sales" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={CHART_COLORS.cyan}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
                <Line type="monotone" dataKey="profit" name="Profit" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900 xl:col-span-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profit earned</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Daily (demo)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="profit" fill="#845adf" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900 xl:col-span-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Leads by source</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Device breakdown (demo)</p>
          <div className="relative mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsBySource}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {(leadsTotal / 1000).toFixed(1)}k
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total</span>
            </div>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {leadsBySource.map((s) => (
              <li key={s.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
                <span className="text-slate-600 dark:text-slate-300">{s.name}</span>
                <span className="ml-auto font-semibold tabular-nums text-slate-900 dark:text-white">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900 xl:col-span-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Exam activity</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Attempts per week (demo)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="attempts" fill="#23b7e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900 xl:col-span-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Deals status</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline mix (demo)</p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {dealStatusSegments.map((s) => (
              <div
                key={s.key}
                className="h-full"
                style={{
                  width: `${(s.count / statusTotal) * 100}%`,
                  background: s.color,
                }}
                title={s.label}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-3">
            {dealStatusSegments.map((s) => (
              <li key={s.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Performance trend</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Average score index (demo)</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#845adf" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activity</h2>
          <ul className="mt-4 space-y-3">
            {mockActivity.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span
                  className={
                    a.type === 'success'
                      ? 'mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500'
                      : a.type === 'warning'
                        ? 'mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500'
                        : 'mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#845adf]'
                  }
                />
                <div>
                  <p className="text-slate-800 dark:text-slate-200">{a.text}</p>
                  <p className="text-xs text-slate-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card dark:border-slate-700/80 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-2 pr-3">Name</th>
                <th className="pb-2 pr-3">Role</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-3 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{u.role}</td>
                  <td className="py-2">
                    <span
                      className={
                        u.status === 'active'
                          ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                      }
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
