import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import { useScore } from '../hooks/useScore'
import { useTimer } from '../hooks/useTimer'
import CircularTimer from '../components/CircularTimer'
import ProgressBar from '../components/ProgressBar'
import Toast from '../components/Toast'
const TIMER_SECONDS = 30
const LABELS = ['A', 'B', 'C', 'D'] as const

export default function QuizPage() {
  const navigate = useNavigate()
  const { category } = useParams<{ category: string }>()
  const { session, answerQuestion, nextQuestion, finishQuiz } = useQuizStore()
  const { comboCount } = useScore()

  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ correct: boolean; points: number } | null>(null)
  const [toast, setToast] = useState({ message: '', type: 'correct' as 'correct' | 'incorrect', visible: false })

  const selectedRef = useRef<number | null>(null)
  const handleAnswerRef = useRef<(idx: number) => void>(() => {})
  const handleNextRef = useRef<() => void>(() => {})

  // 새로고침·직접 URL 접근 시 홈으로 리다이렉트
  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true, state: { refreshed: true } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = useCallback((message: string, type: 'correct' | 'incorrect') => {
    setToast({ message, type, visible: true })
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 1500)
  }, [])

  const handleExpire = useCallback(() => {
    if (selectedRef.current !== null) return
    selectedRef.current = -1
    setSelected(-1)
    setFeedback({ correct: false, points: 0 })
    showToast('⏰ 시간 초과!', 'incorrect')
  }, [showToast])

  const { remaining, reset } = useTimer(TIMER_SECONDS, handleExpire)

  useEffect(() => {
    if (!session) return
    setSelected(null)
    setFeedback(null)
    selectedRef.current = null
    reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentIndex])

  const handleAnswer = useCallback((idx: number) => {
    if (selectedRef.current !== null) return
    selectedRef.current = idx
    setSelected(idx)
    const result = answerQuestion(idx)
    setFeedback(result)
    if (result.correct) {
      showToast(`✅ 정답! +${result.points}점`, 'correct')
    } else {
      showToast('❌ 오답!', 'incorrect')
    }
  }, [answerQuestion, showToast])

  const handleNext = useCallback(() => {
    if (!session) return
    const isLast = session.currentIndex === session.questions.length - 1
    if (isLast) {
      finishQuiz()
      navigate('/result')
    } else {
      nextQuestion()
    }
  }, [session, finishQuiz, nextQuestion, navigate])

  // 최신 핸들러를 ref에 유지 (키보드 핸들러의 stale closure 방지)
  handleAnswerRef.current = handleAnswer
  handleNextRef.current = handleNext

  // 키보드 단축키: 1/2/3/4로 보기 선택, Enter로 다음 문제
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 }
      if (e.key in keyMap) {
        handleAnswerRef.current(keyMap[e.key])
      } else if (e.key === 'Enter' && selectedRef.current !== null) {
        handleNextRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!session) return null

  const question = session.questions[session.currentIndex]
  const isLast = session.currentIndex === session.questions.length - 1
  const categoryLabel = session.category === 'all' ? '전체 도전' : session.category

  const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }[question.difficulty]
  const difficultyColor = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }[question.difficulty]

  const getOptionClass = (idx: number) => {
    const base = 'border-2 rounded-xl px-4 py-3 text-left font-medium transition-all flex items-center gap-3 w-full'
    if (selected === null) {
      return `${base} bg-white border-slate-200 hover:border-indigo-400 hover:scale-105 hover:shadow-sm cursor-pointer`
    }
    if (idx === question.correct_index) {
      return `${base} bg-emerald-50 border-emerald-500`
    }
    if (idx === selected && selected >= 0) {
      return `${base} bg-red-50 border-red-400 animate-shake`
    }
    return `${base} bg-white border-slate-100 opacity-40`
  }

  const getLabelClass = (idx: number) => {
    const base = 'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0'
    if (selected === null) return `${base} bg-slate-100 text-slate-600`
    if (idx === question.correct_index) return `${base} bg-emerald-500 text-white`
    if (idx === selected && selected >= 0) return `${base} bg-red-500 text-white`
    return `${base} bg-slate-100 text-slate-300`
  }

  const getOptionIcon = (idx: number) => {
    if (selected === null) return LABELS[idx]
    if (idx === question.correct_index) return '✓'
    if (idx === selected && selected >= 0) return '✗'
    return LABELS[idx]
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <div className="w-full max-w-md md:max-w-2xl bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-indigo-600">{categoryLabel}</span>
          <span className="text-slate-500 font-medium">
            {session.currentIndex + 1} / {session.questions.length}
          </span>
          <span className="font-bold text-slate-700">점수: {session.score}</span>
        </div>

        <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

        {/* 타이머 + 콤보 + 난이도 */}
        <div className="flex items-center gap-3">
          <CircularTimer remaining={remaining} total={TIMER_SECONDS} />
          <div className="flex-1 flex flex-col gap-1">
            <span className={`self-start text-xs px-2.5 py-1 rounded-full font-semibold ${difficultyColor}`}>
              {difficultyLabel}
            </span>
            {comboCount >= 2 && (
              <span className="self-start bg-orange-100 text-orange-600 text-xs px-2.5 py-1 rounded-full font-bold">
                🔥 {comboCount}연속 정답 콤보!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 hidden md:block">1~4 키로 선택, Enter로 다음</p>
        </div>

        {/* 문제 */}
        <p className="text-lg font-semibold text-slate-800 leading-relaxed">
          Q{session.currentIndex + 1}. {question.question_text}
        </p>

        {/* 보기 */}
        <div className="flex flex-col gap-2" role="group" aria-label="보기">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              aria-label={`보기 ${idx + 1}: ${opt}${selected !== null && idx === question.correct_index ? ' (정답)' : ''}`}
              className={getOptionClass(idx)}
            >
              <span className={getLabelClass(idx)}>{getOptionIcon(idx)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {/* 피드백 */}
        {feedback && (
          <div
            className={`rounded-xl p-4 text-sm border ${
              feedback.correct
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <p className="font-bold mb-1 flex items-center gap-1">
              {feedback.correct ? (
                <><span aria-hidden="true">✅</span> 정답! (+{feedback.points}점)</>
              ) : selected === -1 ? (
                <><span aria-hidden="true">⏰</span> 시간 초과! 정답: {LABELS[question.correct_index]}</>
              ) : (
                <><span aria-hidden="true">❌</span> 오답! 정답: {LABELS[question.correct_index]}</>
              )}
            </p>
            <p className="text-slate-600 text-xs">{question.explanation}</p>
          </div>
        )}

        {/* 다음 버튼 */}
        {selected !== null && (
          <button
            onClick={handleNext}
            aria-label={isLast ? '결과 보기' : '다음 문제'}
            className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {isLast ? '결과 보기 →' : '다음 문제 →'}
          </button>
        )}
      </div>

      {/* 키보드 단축키 힌트 (모바일 숨김) */}
      <p className="mt-3 text-xs text-slate-400 md:hidden">
        {category && decodeURIComponent(category)}
      </p>
    </div>
  )
}
