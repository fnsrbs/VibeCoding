import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import Toast from '../components/Toast'
import type { CategoryFilter } from '../types/quiz'

const CATEGORIES: { value: CategoryFilter; emoji: string; desc: string; color: string }[] = [
  { value: '한국사', emoji: '🏛️', desc: '조선시대~현대사', color: 'from-amber-400 to-orange-500' },
  { value: '과학', emoji: '🔬', desc: '물리·화학·생물', color: 'from-blue-400 to-cyan-500' },
  { value: '지리', emoji: '🌏', desc: '한국·세계 지리', color: 'from-emerald-400 to-green-500' },
  { value: '일반상식', emoji: '💡', desc: '시사·문화·스포츠', color: 'from-purple-400 to-pink-500' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const startQuiz = useQuizStore((s) => s.startQuiz)
  const [toast, setToast] = useState({ message: '', type: 'incorrect' as 'correct' | 'incorrect', visible: false })

  useEffect(() => {
    const state = location.state as { refreshed?: boolean } | null
    if (state?.refreshed) {
      setToast({ message: '⚠️ 퀴즈가 초기화되었습니다. 다시 시작해주세요.', type: 'incorrect', visible: true })
      setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000)
      window.history.replaceState({}, '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStart = (category: CategoryFilter) => {
    startQuiz(category)
    navigate(`/quiz/${encodeURIComponent(category)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 flex flex-col p-4 animate-fade-in">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* 상단 버튼 */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => navigate('/teacher')}
          aria-label="선생님 모드"
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-full transition text-sm border border-white/30"
        >
          👨‍🏫 선생님
        </button>
        <button
          onClick={() => navigate('/ranking')}
          aria-label="랭킹 보기"
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-full transition text-sm border border-white/30"
        >
          🏆 랭킹
        </button>
      </div>

      {/* 타이틀 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-white">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold mb-2 drop-shadow">🧠 상식 퀴즈</h1>
          <p className="text-lg opacity-80">카테고리를 선택해 퀴즈를 시작하세요!</p>
        </div>

        {/* 카테고리 카드 */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm md:max-w-lg">
          {CATEGORIES.map(({ value, emoji, desc, color }) => (
            <button
              key={value}
              onClick={() => handleStart(value)}
              aria-label={`${value} 퀴즈 시작`}
              className={`bg-gradient-to-br ${color} rounded-2xl p-5 flex flex-col items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform`}
            >
              <span className="text-4xl">{emoji}</span>
              <span className="font-bold text-base">{value}</span>
              <span className="text-xs opacity-80">{desc}</span>
            </button>
          ))}
        </div>

        {/* 전체 도전 */}
        <button
          onClick={() => handleStart('all')}
          aria-label="전체 도전 시작 (40문제)"
          className="bg-white text-indigo-700 font-extrabold py-4 px-12 rounded-2xl text-lg shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all"
        >
          🚀 전체 도전 <span className="text-sm font-semibold opacity-60">(40문제)</span>
        </button>
      </div>
    </div>
  )
}
