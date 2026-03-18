import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'

export default function App() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-500 via-indigo-500 to-slate-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50/90 px-0 pb-4 pt-8 shadow-xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/quiz" element={<div className="mx-auto max-w-md px-4 py-6">Quiz page (next step)</div>} />
          <Route path="/result" element={<div className="mx-auto max-w-md px-4 py-6">Result page (next step)</div>} />
          <Route path="/review" element={<div className="mx-auto max-w-md px-4 py-6">Review page (next step)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
