import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import type { Category } from '../types/quiz'

const CATEGORIES: { value: Category; emoji: string; desc: string }[] = [
  { value: '한국사', emoji: '🏛️', desc: '조선시대~현대사' },
  { value: '과학', emoji: '🔬', desc: '물리·화학·생물' },
  { value: '지리', emoji: '🌏', desc: '한국·세계 지리' },
  { value: '일반상식', emoji: '💡', desc: '시사·문화·스포츠' },
]

export default function CategoryPage() {
  const navigate = useNavigate()
  const startQuiz = useQuizStore((s) => s.startQuiz)

  const handleSelect = (category: Category) => {
    startQuiz(category)
    navigate('/quiz')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">카테고리 선택</h2>
      <p className="text-gray-500 mb-8">풀고 싶은 분야를 선택하세요</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {CATEGORIES.map(({ value, emoji, desc }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-blue-400 hover:shadow-md transition"
          >
            <span className="text-4xl">{emoji}</span>
            <span className="font-bold text-gray-800">{value}</span>
            <span className="text-sm text-gray-400">{desc}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-8 text-gray-400 hover:text-gray-600 transition"
      >
        ← 홈으로
      </button>
    </div>
  )
}
