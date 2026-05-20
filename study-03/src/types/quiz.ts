export type Category = '한국사' | '과학' | '지리' | '일반상식'
export type CategoryFilter = Category | 'all'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  id: number
  category: Category
  difficulty: Difficulty
  question_text: string
  options: [string, string, string, string]
  correct_index: 0 | 1 | 2 | 3
  explanation: string
}

export interface QuizSession {
  category: CategoryFilter
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  score: number
  startTime: number
  questionStartTime: number
  comboCount: number
}

export interface RankingEntry {
  nickname: string
  score: number
  category: CategoryFilter
  date: string
  savedAt: number
}

export type Screen = 'home' | 'quiz' | 'result' | 'ranking'
