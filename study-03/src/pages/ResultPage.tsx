import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import { useScore } from '../hooks/useScore'
import type { Category } from '../types/quiz'

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    if (target === 0) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return value
}

function AnimatedStars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 justify-center text-4xl" aria-label={`별점 ${count}점 / 5점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= count ? 'animate-star-pop inline-block' : 'opacity-20 inline-block'}
          style={i <= count ? { animationDelay: `${(i - 1) * 150}ms` } : {}}
          aria-hidden="true"
        >
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
  const displayScore = useCountUp(session?.score ?? 0)

  if (!session) {
    navigate('/')
    return null
  }

  const total = session.questions.length
  const stars = getStarCount(correctCount, total)

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md md:max-w-2xl flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-center text-slate-800">🎉 퀴즈 완료!</h2>

        {/* 점수 + 별점 */}
        <div className="text-center">
          <p
            className="text-7xl font-extrabold text-indigo-600 leading-none tabular-nums"
            aria-label={`최종 점수 ${session.score}점`}
          >
            {displayScore}
          </p>
          <p className="text-slate-400 text-sm mb-3">점</p>
          <AnimatedStars count={stars} />
          <p className="text-slate-500 mt-2 text-sm">
            {correctCount} / {total} 정답 ·{' '}
            <span className="font-semibold text-indigo-600">
              {session.category === 'all' ? '전체 도전' : session.category}
            </span>
          </p>
        </div>

        {/* 카테고리별 정답률 */}
        <div>
          <h3 className="font-bold text-slate-700 text-sm mb-2">카테고리별 정답률</h3>
          <div className="flex flex-col gap-2">
            {categoryStats.map(({ category, correct, total: t }) => {
              const pct = t > 0 ? Math.round((correct / t) * 100) : 0
              return (
                <div key={category} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-16 flex-shrink-0 text-right">
                    {category}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${category} 정답률 ${pct}%`}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-14 text-right font-medium">
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
            <h3 className="font-bold text-slate-700 text-sm mb-2">
              오답 목록 ({wrongAnswers.length}개)
            </h3>
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
              {wrongAnswers.map(({ q, userAns }) => (
                <div key={q.id} className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-slate-700 mb-1">{q.question_text}</p>
                  <p className="text-red-500 flex items-center gap-1">
                    <span aria-hidden="true">✗</span> 내 답:{' '}
                    {userAns !== null && userAns >= 0 ? q.options[userAns] : '(시간 초과)'}
                  </p>
                  <p className="text-emerald-600 flex items-center gap-1">
                    <span aria-hidden="true">✓</span> 정답: {q.options[q.correct_index]}
                  </p>
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
              aria-label="닉네임 입력"
              className="flex-1 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 border-slate-200"
            />
            <button
              onClick={handleSave}
              aria-label="랭킹 등록"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
            >
              등록
            </button>
          </div>
        ) : (
          <p className="text-center text-emerald-600 font-semibold text-sm">
            ✅ 랭킹에 저장되었습니다!{' '}
            <button
              onClick={() => navigate('/ranking')}
              aria-label="랭킹 확인하기"
              className="underline text-indigo-600 ml-1"
            >
              확인하기
            </button>
          </p>
        )}

        {/* 액션 버튼 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleRetry}
            aria-label="같은 카테고리 다시 도전"
            className="bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all"
          >
            다시 도전
          </button>
          <button
            onClick={handleHome}
            aria-label="다른 카테고리 선택"
            className="bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 active:scale-95 transition-all"
          >
            다른 카테고리
          </button>
          <button
            onClick={handleHome}
            aria-label="홈으로 이동"
            className="border-2 border-slate-200 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  )
}
