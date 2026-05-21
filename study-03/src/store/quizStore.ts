import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Category, CategoryFilter, QuizSession, RankingEntry, Screen } from '../types/quiz'
import { questions, getQuestionsByCategory } from '../data/questions'

interface QuizState {
  session: QuizSession | null
  rankings: RankingEntry[]
  currentScreen: Screen
  lastSavedAt: number | null

  startQuiz: (category: CategoryFilter) => void
  answerQuestion: (selectedIndex: number) => { correct: boolean; points: number }
  nextQuestion: () => void
  finishQuiz: () => void
  saveRanking: (nickname: string) => void
  resetQuiz: () => void
  setScreen: (screen: Screen) => void
}

function calcPoints(correct: boolean, elapsedMs: number, newComboCount: number): number {
  if (!correct) return 0
  let pts = 10
  if (elapsedMs <= 10000) pts += 5
  if (newComboCount >= 3) pts += 10
  return pts
}

// localStorage에 QuotaExceededError 발생 시 오래된 항목 자동 삭제
const safeStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      try {
        const parsed = JSON.parse(value)
        if (parsed.state?.rankings) {
          parsed.state.rankings = (parsed.state.rankings as RankingEntry[]).slice(0, 20)
          localStorage.setItem(name, JSON.stringify(parsed))
        }
      } catch {
        try {
          localStorage.removeItem(name)
        } catch {
          // ignore
        }
      }
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // ignore
    }
  },
}))

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      session: null,
      rankings: [],
      currentScreen: 'home',
      lastSavedAt: null,

      startQuiz(category) {
        const pool = category === 'all' ? questions : getQuestionsByCategory(category)
        const count = category === 'all' ? 40 : 10
        const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
        set({
          session: {
            category,
            questions: shuffled,
            currentIndex: 0,
            answers: new Array(shuffled.length).fill(null) as null[],
            score: 0,
            startTime: Date.now(),
            questionStartTime: Date.now(),
            comboCount: 0,
          },
          currentScreen: 'quiz',
        })
      },

      answerQuestion(selectedIndex) {
        const { session } = get()
        if (!session) return { correct: false, points: 0 }

        const question = session.questions[session.currentIndex]
        const correct = selectedIndex === question.correct_index
        const elapsed = Date.now() - session.questionStartTime
        const newCombo = correct ? session.comboCount + 1 : 0
        const points = calcPoints(correct, elapsed, newCombo)

        const newAnswers = [...session.answers]
        newAnswers[session.currentIndex] = selectedIndex

        set({
          session: {
            ...session,
            answers: newAnswers,
            score: session.score + points,
            comboCount: newCombo,
          },
        })

        return { correct, points }
      },

      nextQuestion() {
        const { session } = get()
        if (!session) return
        const nextIndex = session.currentIndex + 1
        if (nextIndex < session.questions.length) {
          set({
            session: {
              ...session,
              currentIndex: nextIndex,
              questionStartTime: Date.now(),
            },
          })
        }
      },

      finishQuiz() {
        const { session } = get()
        if (!session) return
        const allCorrect = session.answers.every(
          (ans, i) => ans !== null && ans === session.questions[i].correct_index,
        )
        const finalScore = allCorrect ? session.score + 20 : session.score
        set({
          session: { ...session, score: finalScore },
          currentScreen: 'result',
        })
      },

      saveRanking(nickname) {
        const { session, rankings } = get()
        if (!session) return
        const now = Date.now()
        const entry: RankingEntry = {
          nickname,
          score: session.score,
          category: session.category,
          date: new Date().toLocaleDateString('ko-KR'),
          savedAt: now,
        }
        const updated = [...rankings, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 100)
        set({ rankings: updated, lastSavedAt: now })
      },

      resetQuiz() {
        set({ session: null, currentScreen: 'home' })
      },

      setScreen(screen) {
        set({ currentScreen: screen })
      },
    }),
    {
      name: 'quiz-storage',
      storage: safeStorage,
      partialize: (state) => ({ rankings: state.rankings }),
    },
  ),
)

export type { Category }
