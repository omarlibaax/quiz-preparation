import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50 px-3 py-8 sm:px-4 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white/75 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
