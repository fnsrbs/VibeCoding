import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import { useScore } from '../hooks/useScore'
import type { Category } from '../types/quiz'

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 justify-center text-3xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= count ? 1 : 0.2 }}>
          ⭐
        </span>
      ))}
    </div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { session, saveRanking, resetQuiz, startQuiz } = useQuizStore()
  const { correctCount, getStarCount } = useScore()
  const [nickname, setNickname] = useState('')
  const [saved, setSaved] = useState(false)

  if (!session) {
    navigate('/')
    return null
  }

  const total = session.questions.length
  const stars = getStarCount(correctCount, total)

  // 카테고리별 정답률
  const categoryStats = useMemo(() => {
    const cats = [...new Set(session.questions.map((q) => q.category))] as Category[]
    return cats.map((cat) => {
      const indices = session.questions.reduce<number[]>(
        (acc, q, i) => (q.category === cat ? [...acc, i] : acc),
        [],
      )
      const correct = indices.filter(
        (i) => session.answers[i] === session.questions[i].correct_index,
      ).length
      return { category: cat, correct, total: indices.length }
    })
  }, [session])

  // 오답 목록
  const wrongAnswers = session.questions
    .map((q, i) => ({ q, i, userAns: session.answers[i] }))
    .filter(({ q, i }) => session.answers[i] !== q.correct_index)

  const handleSave = () => {
    if (!nickname.trim() || saved) return
    saveRanking(nickname.trim())
    setSaved(true)
  }

  const handleRetry = () => {
    startQuiz(session.category)
    navigate(`/quiz/${encodeURIComponent(session.category)}`)
  }

  const handleHome = () => {
    resetQuiz()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-center text-gray-800">🎉 퀴즈 완료!</h2>

        {/* 점수 + 별점 */}
        <div className="text-center">
          <p className="text-7xl font-extrabold text-blue-600 leading-none">{session.score}</p>
          <p className="text-gray-400 text-sm mb-2">점</p>
          <StarDisplay count={stars} />
          <p className="text-gray-500 mt-2 text-sm">
            {correctCount} / {total} 정답 ·{' '}
            <span className="font-semibold text-blue-600">
              {session.category === 'all' ? '전체 도전' : session.category}
            </span>
          </p>
        </div>

        {/* 카테고리별 정답률 막대 그래프 */}
        <div>
          <h3 className="font-bold text-gray-700 text-sm mb-2">카테고리별 정답률</h3>
          <div className="flex flex-col gap-2">
            {categoryStats.map(({ category, correct, total: t }) => {
              const pct = t > 0 ? Math.round((correct / t) * 100) : 0
              return (
                <div key={category} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16 flex-shrink-0 text-right">
                    {category}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-14 text-right font-medium">
                    {correct}/{t} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 오답 목록 */}
        {wrongAnswers.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-2">
              오답 목록 ({wrongAnswers.length}개)
            </h3>
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
              {wrongAnswers.map(({ q, userAns }) => (
                <div key={q.id} className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-gray-700 mb-1">{q.question_text}</p>
                  <p className="text-red-500">
                    내 답:{' '}
                    {userAns !== null && userAns >= 0 ? q.options[userAns] : '(시간 초과)'}
                  </p>
                  <p className="text-green-600">정답: {q.options[q.correct_index]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 닉네임 + 랭킹 등록 */}
        {!saved ? (
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="닉네임 입력 후 랭킹 등록"
              maxLength={10}
              className="flex-1 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
            >
              등록
            </button>
          </div>
        ) : (
          <p className="text-center text-green-600 font-semibold text-sm">
            ✅ 랭킹에 저장되었습니다!{' '}
            <button
              onClick={() => navigate('/ranking')}
              className="underline text-blue-600 ml-1"
            >
              확인하기
            </button>
          </p>
        )}

        {/* 액션 버튼 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
          >
            다시 도전
          </button>
          <button
            onClick={handleHome}
            className="bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition"
          >
            다른 카테고리
          </button>
          <button
            onClick={handleHome}
            className="border-2 border-gray-200 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition text-gray-700"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  )
}
