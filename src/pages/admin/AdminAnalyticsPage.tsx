import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { examActivity, performanceTrend } from '../../data/adminDashboardMock'

const engagement = [
  { day: 'Mon', sessions: 1200, avgTime: 18 },
  { day: 'Tue', sessions: 1350, avgTime: 21 },
  { day: 'Wed', sessions: 1280, avgTime: 19 },
  { day: 'Thu', sessions: 1420, avgTime: 22 },
  { day: 'Fri', sessions: 1600, avgTime: 24 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Engagement and performance (demo data).</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Score trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Weekly attempts</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="attempts" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Sessions vs. avg. time (min)</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagement}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#6366f1" name="Sessions" />
              <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#f59e0b" name="Avg time" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
