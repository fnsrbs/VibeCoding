import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import { useScore } from '../hooks/useScore'
import { useTimer } from '../hooks/useTimer'
import CircularTimer from '../components/CircularTimer'
import ProgressBar from '../components/ProgressBar'
import Toast from '../components/Toast'
import type { CategoryFilter } from '../types/quiz'

const TIMER_SECONDS = 30
const LABELS = ['A', 'B', 'C', 'D'] as const

export default function QuizPage() {
  const navigate = useNavigate()
  const { category } = useParams<{ category: string }>()
  const { session, startQuiz, answerQuestion, nextQuestion, finishQuiz } = useQuizStore()
  const { comboCount } = useScore()

  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ correct: boolean; points: number } | null>(null)
  const [toast, setToast] = useState({ message: '', type: 'correct' as 'correct' | 'incorrect', visible: false })

  const selectedRef = useRef<number | null>(null)

  // 직접 URL 접근 / 새로고침 시 퀴즈 재시작
  useEffect(() => {
    if (!session && category) {
      startQuiz(decodeURIComponent(category) as CategoryFilter)
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

  // 문제 전환 시 리셋
  useEffect(() => {
    if (!session) return
    setSelected(null)
    setFeedback(null)
    selectedRef.current = null
    reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentIndex])

  if (!session) return null

  const question = session.questions[session.currentIndex]
  const isLast = session.currentIndex === session.questions.length - 1

  const handleAnswer = (idx: number) => {
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
  }

  const handleNext = () => {
    if (isLast) {
      finishQuiz()
      navigate('/result')
    } else {
      nextQuestion()
    }
  }

  const getOptionClass = (idx: number) => {
    const base = 'border-2 rounded-xl px-4 py-3 text-left font-medium transition-all flex items-center gap-3 w-full'
    if (selected === null) return `${base} bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm cursor-pointer`
    if (idx === question.correct_index) return `${base} bg-green-50 border-green-500`
    if (idx === selected && selected >= 0) return `${base} bg-red-50 border-red-400`
    return `${base} bg-white border-gray-100 opacity-50`
  }

  const getLabelClass = (idx: number) => {
    const base = 'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0'
    if (selected === null) return `${base} bg-gray-100 text-gray-600`
    if (idx === question.correct_index) return `${base} bg-green-500 text-white`
    if (idx === selected && selected >= 0) return `${base} bg-red-500 text-white`
    return `${base} bg-gray-100 text-gray-300`
  }

  const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }[question.difficulty]
  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  }[question.difficulty]

  const categoryLabel = session.category === 'all' ? '전체 도전' : session.category

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-blue-600">{categoryLabel}</span>
          <span className="text-gray-500 font-medium">
            {session.currentIndex + 1} / {session.questions.length}
          </span>
          <span className="font-bold text-gray-700">점수: {session.score}</span>
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
        </div>

        {/* 문제 */}
        <p className="text-lg font-semibold text-gray-800 leading-relaxed">
          Q{session.currentIndex + 1}. {question.question_text}
        </p>

        {/* 보기 */}
        <div className="flex flex-col gap-2">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              className={getOptionClass(idx)}
            >
              <span className={getLabelClass(idx)}>{LABELS[idx]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {/* 피드백 */}
        {feedback && (
          <div
            className={`rounded-xl p-4 text-sm border ${
              feedback.correct
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <p className="font-bold mb-1">
              {feedback.correct
                ? `✅ 정답! (+${feedback.points}점)`
                : selected === -1
                  ? `⏰ 시간 초과! 정답: ${LABELS[question.correct_index]}`
                  : `❌ 오답! 정답: ${LABELS[question.correct_index]}`}
            </p>
            <p className="text-gray-600 text-xs">{question.explanation}</p>
          </div>
        )}

        {/* 다음 버튼 */}
        {selected !== null && (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            {isLast ? '결과 보기 →' : '다음 문제 →'}
          </button>
        )}
      </div>
    </div>
  )
}
