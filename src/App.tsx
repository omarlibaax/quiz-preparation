import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'

export default function App() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/quiz" element={<div className="mx-auto max-w-md px-4 py-6">Quiz page (next step)</div>} />
        <Route path="/result" element={<div className="mx-auto max-w-md px-4 py-6">Result page (next step)</div>} />
        <Route path="/review" element={<div className="mx-auto max-w-md px-4 py-6">Review page (next step)</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
