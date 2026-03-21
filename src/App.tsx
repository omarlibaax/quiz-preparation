import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import AdminDashboardLayout from './layouts/AdminDashboardLayout'
import MainShell from './layouts/MainShell'
import QuizFocusShell from './layouts/QuizFocusShell'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import AttemptsPage from './pages/AttemptsPage'
import DashboardPage from './pages/DashboardPage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import ReviewPage from './pages/ReviewPage'
import AdminDashboardHome from './pages/admin/AdminDashboardHome'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminExamsPage from './pages/admin/AdminExamsPage'
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminOperationsPage from './pages/admin/AdminOperationsPage'

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboardLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardHome />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="exams" element={<AdminExamsPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="operations" element={<AdminOperationsPage />} />
        </Route>

        <Route path="/auth" element={<AuthPage />} />

        <Route element={<MainShell />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/attempts"
            element={
              <RequireAuth>
                <AttemptsPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route element={<QuizFocusShell />}>
          <Route
            path="/setup"
            element={
              <RequireAuth>
                <SetupPage />
              </RequireAuth>
            }
          />
          <Route
            path="/quiz"
            element={
              <RequireAuth>
                <QuizPage />
              </RequireAuth>
            }
          />
          <Route
            path="/result"
            element={
              <RequireAuth>
                <ResultPage />
              </RequireAuth>
            }
          />
          <Route
            path="/review"
            element={
              <RequireAuth>
                <ReviewPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
