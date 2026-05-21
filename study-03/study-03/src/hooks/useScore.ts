import { useQuizStore } from '../store/quizStore'

export function useScore() {
  const session = useQuizStore((s) => s.session)

  const getStarCount = (correctCount: number, total: number): number => {
    if (total === 0) return 0
    const pct = (correctCount / total) * 100
    if (pct >= 90) return 5
    if (pct >= 70) return 4
    if (pct >= 50) return 3
    if (pct >= 30) return 2
    return 1
  }

  const correctCount = session
    ? session.answers.filter(
        (a, i) => a !== null && a === session.questions[i]?.correct_index,
      ).length
    : 0

  return {
    score: session?.score ?? 0,
    comboCount: session?.comboCount ?? 0,
    correctCount,
    getStarCount,
  }
}
