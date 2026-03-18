import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-white px-4 pb-10 pt-6 sm:px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/quiz" element={<div className="mx-auto w-full max-w-3xl px-4 py-6">Quiz page (next step)</div>} />
          <Route path="/result" element={<div className="mx-auto w-full max-w-3xl px-4 py-6">Result page (next step)</div>} />
          <Route path="/review" element={<div className="mx-auto w-full max-w-3xl px-4 py-6">Review page (next step)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
