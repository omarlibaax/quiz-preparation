import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 px-2 py-8 sm:px-4 sm:py-10">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-fuchsia-200/10 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-10 h-56 w-56 rounded-full bg-sky-200/10 blur-3xl" />

        <div className="relative overflow-hidden rounded-[2.2rem] bg-white/90 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
          <div className="rounded-[1.6rem] bg-white/70 p-0 shadow-inner">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
