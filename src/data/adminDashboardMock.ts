/** Demo series for charts — replace with API aggregates later */
export const performanceTrend = [
  { name: 'Jan', score: 62 },
  { name: 'Feb', score: 68 },
  { name: 'Mar', score: 71 },
  { name: 'Apr', score: 74 },
  { name: 'May', score: 78 },
  { name: 'Jun', score: 82 },
]

/** Multi-series line chart (Sales / Revenue / Profit) */
export const revenueAnalytics = [
  { month: 'Jan', sales: 32, revenue: 24, profit: 18 },
  { month: 'Feb', sales: 38, revenue: 28, profit: 21 },
  { month: 'Mar', sales: 35, revenue: 30, profit: 22 },
  { month: 'Apr', sales: 42, revenue: 34, profit: 26 },
  { month: 'May', sales: 48, revenue: 40, profit: 30 },
  { month: 'Jun', sales: 52, revenue: 44, profit: 33 },
  { month: 'Jul', sales: 55, revenue: 46, profit: 35 },
  { month: 'Aug', sales: 58, revenue: 50, profit: 38 },
  { month: 'Sep', sales: 54, revenue: 47, profit: 36 },
  { month: 'Oct', sales: 60, revenue: 52, profit: 40 },
  { month: 'Nov', sales: 64, revenue: 56, profit: 43 },
  { month: 'Dec', sales: 68, revenue: 58, profit: 45 },
]

export const profitByDay = [
  { day: 'Mon', profit: 12 },
  { day: 'Tue', profit: 18 },
  { day: 'Wed', profit: 15 },
  { day: 'Thu', profit: 22 },
  { day: 'Fri', profit: 28 },
  { day: 'Sat', profit: 20 },
  { day: 'Sun', profit: 16 },
]

export const examActivity = [
  { name: 'Week 1', attempts: 420 },
  { name: 'Week 2', attempts: 512 },
  { name: 'Week 3', attempts: 488 },
  { name: 'Week 4', attempts: 601 },
]

export const userDistribution = [
  { name: 'Students', value: 78, fill: '#6366f1' },
  { name: 'Admins', value: 4, fill: '#8b5cf6' },
  { name: 'Guests', value: 18, fill: '#94a3b8' },
]

/** Doughnut — leads by device/source */
export const leadsBySource = [
  { name: 'Mobile', value: 1240, fill: '#845adf' },
  { name: 'Desktop', value: 980, fill: '#23b7e5' },
  { name: 'Laptop', value: 756, fill: '#f5b849' },
  { name: 'Tablet', value: 420, fill: '#49b6a4' },
]

export type TopDealRow = { id: string; name: string; email: string; amount: string; avatar: string }

export const topDeals: TopDealRow[] = [
  { id: 'd1', name: 'Amina Hassan', email: 'amina@school.edu', amount: '$2,450', avatar: 'AH' },
  { id: 'd2', name: 'Omar Ali', email: 'omar@school.edu', amount: '$1,890', avatar: 'OA' },
  { id: 'd3', name: 'Sara Ibrahim', email: 'sara@school.edu', amount: '$1,120', avatar: 'SI' },
  { id: 'd4', name: 'Youssef Nasser', email: 'youssef@school.edu', amount: '$980', avatar: 'YN' },
]

export const dealStatusSegments = [
  { key: 'successful', label: 'Successful', count: 128, color: '#49b6a4' },
  { key: 'pending', label: 'Pending', count: 42, color: '#f5b849' },
  { key: 'rejected', label: 'Rejected', count: 18, color: '#f06548' },
  { key: 'upcoming', label: 'Upcoming', count: 24, color: '#845adf' },
]

/** Tiny series for KPI sparklines */
export const kpiSparklines = {
  customers: [12, 14, 13, 18, 20, 22, 21, 25, 28, 30, 32, 35],
  revenue: [8, 10, 9, 12, 15, 18, 17, 22, 24, 26, 28, 30],
  deals: [4, 5, 6, 5, 8, 9, 10, 11, 12, 14, 15, 16],
} as const

export type MockUserRow = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'blocked'
  joined: string
}

export const mockUsers: MockUserRow[] = [
  { id: '1', name: 'Amina Hassan', email: 'amina@school.edu', role: 'STUDENT', status: 'active', joined: '2025-11-02' },
  { id: '2', name: 'Omar Ali', email: 'omar@school.edu', role: 'STUDENT', status: 'active', joined: '2025-11-05' },
  { id: '3', name: 'Sara Ibrahim', email: 'sara@school.edu', role: 'STUDENT', status: 'blocked', joined: '2025-10-18' },
  { id: '4', name: 'System Admin', email: 'admin@platform.local', role: 'ADMIN', status: 'active', joined: '2025-09-01' },
]

export type MockActivity = { id: string; text: string; time: string; type: 'info' | 'success' | 'warning' }

export const mockActivity: MockActivity[] = [
  { id: 'a1', text: 'New exam published: Physics Midterm', time: '12 min ago', type: 'success' },
  { id: 'a2', text: 'Import job completed — 600 questions', time: '1 h ago', type: 'info' },
  { id: 'a3', text: 'User flagged for review', time: '3 h ago', type: 'warning' },
]

export const mockNotifications = [
  { id: 'n1', title: 'Database backup', body: 'Nightly backup succeeded.', time: '2h ago' },
  { id: 'n2', title: 'API usage', body: '85% of monthly quota.', time: '5h ago' },
]
