import { Routes, Route, Navigate } from 'react-router-dom'
import { isOnboarded } from './utils/storage.js'
import Layout from './components/layout/Layout.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Home from './pages/Home.jsx'
import Lessons from './pages/Lessons.jsx'
import LessonDetail from './pages/LessonDetail.jsx'
import Practice from './pages/Practice.jsx'
import Quiz from './pages/Quiz.jsx'
import CouplesMode from './pages/CouplesMode.jsx'
import Progress from './pages/Progress.jsx'
import Pronunciation from './pages/Pronunciation.jsx'

function RequireOnboarding({ children }) {
  if (!isOnboarded()) return <Navigate to="/welcome" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Onboarding />} />
      <Route
        path="/"
        element={
          <RequireOnboarding>
            <Layout />
          </RequireOnboarding>
        }
      >
        <Route index element={<Home />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="lessons/:lessonId" element={<LessonDetail />} />
        <Route path="practice" element={<Practice />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="couples" element={<CouplesMode />} />
        <Route path="progress" element={<Progress />} />
        <Route path="pronunciation" element={<Pronunciation />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
