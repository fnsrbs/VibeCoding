import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import type { Category } from '../types/quiz'

type TabValue = 'all' | Category

const TABS: { label: string; value: TabValue }[] = [
  { label: '전체', value: 'all' },
  { label: '한국사', value: '한국사' },
  { label: '과학', value: '과학' },
  { label: '지리', value: '지리' },
  { label: '일반상식', value: '일반상식' },
]

const MEDALS = ['🥇', '🥈', '🥉']

const CATEGORY_COLOR: Record<string, string> = {
  한국사: 'bg-amber-100 text-amber-700',
  과학: 'bg-blue-100 text-blue-700',
  지리: 'bg-green-100 text-green-700',
  일반상식: 'bg-purple-100 text-purple-700',
  all: 'bg-gray-100 text-gray-700',
}

export default function RankingPage() {
  const navigate = useNavigate()
  const { rankings, lastSavedAt } = useQuizStore()
  const [activeTab, setActiveTab] = useState<TabValue>('all')

  const filtered = rankings
    .filter((r) => activeTab === 'all' || r.category === activeTab)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🏆 랭킹</h2>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 transition text-sm"
          >
            ← 홈으로
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition flex-shrink-0 ${
                activeTab === value
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 순위 목록 */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 mt-24">
            <p className="text-4xl mb-3">📭</p>
            <p>아직 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((entry, i) => {
              const isMe = lastSavedAt !== null && entry.savedAt === lastSavedAt
              const catLabel = entry.category === 'all' ? '전체도전' : entry.category
              return (
                <div
                  key={`${entry.nickname}-${entry.savedAt}`}
                  className={`rounded-2xl p-4 flex items-center gap-3 ${
                    isMe
                      ? 'bg-blue-50 border-2 border-blue-400 shadow-md'
                      : 'bg-white shadow-sm border border-gray-100'
                  }`}
                >
                  <span className="text-2xl w-9 text-center flex-shrink-0">
                    {i < 3 ? MEDALS[i] : <span className="text-gray-400 font-bold text-base">{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-800 truncate">{entry.nickname}</p>
                      {isMe && (
                        <span className="text-xs text-blue-500 font-semibold flex-shrink-0">← 나</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{entry.date}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                      CATEGORY_COLOR[entry.category] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {catLabel}
                  </span>
                  <span className="text-xl font-extrabold text-blue-600 flex-shrink-0">
                    {entry.score}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
