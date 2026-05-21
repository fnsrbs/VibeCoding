import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import RankingPage from './pages/RankingPage'
import TeacherPage from './pages/TeacherPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter basename="/quiz-game">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:category" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
