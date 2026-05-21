import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '../store/quizStore'
import type { Category, CategoryFilter, RankingEntry } from '../types/quiz'

const CATEGORIES: Category[] = ['한국사', '과학', '지리', '일반상식']
const CATEGORY_MAX = 250

const CAT_EMOJI: Record<string, string> = {
  한국사: '🏛️',
  과학: '🔬',
  지리: '🌏',
  일반상식: '💡',
}

const MEDALS = ['🥇', '🥈', '🥉']

type StudentData = {
  nickname: string
  scores: Partial<Record<CategoryFilter, number>>
  total: number
  lastPlayedAt: number
  playCount: number
}

function buildStudentData(rankings: RankingEntry[]): StudentData[] {
  const map = new Map<string, StudentData>()
  for (const entry of rankings) {
    if (!map.has(entry.nickname)) {
      map.set(entry.nickname, {
        nickname: entry.nickname,
        scores: {},
        total: 0,
        lastPlayedAt: entry.savedAt,
        playCount: 0,
      })
    }
    const s = map.get(entry.nickname)!
    s.scores[entry.category] = Math.max(s.scores[entry.category] ?? 0, entry.score)
    s.lastPlayedAt = Math.max(s.lastPlayedAt, entry.savedAt)
    s.playCount++
  }
  for (const s of map.values()) {
    s.total = Object.values(s.scores).reduce((a, b) => a + b, 0)
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

function daysSince(ms: number) {
  return Math.floor((Date.now() - ms) / 86_400_000)
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString('ko-KR')
}

type Tab = 'overview' | 'ranking' | 'analysis' | 'attention'

export default function TeacherPage() {
  const navigate = useNavigate()
  const { rankings } = useQuizStore()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const students = useMemo(() => buildStudentData(rankings), [rankings])

  const avgTotal = useMemo(
    () => (students.length ? Math.round(students.reduce((a, s) => a + s.total, 0) / students.length) : 0),
    [students],
  )

  const catStats = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const scores = students.filter((s) => s.scores[cat] !== undefined).map((s) => s.scores[cat]!)
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const rate = Math.round((avg / CATEGORY_MAX) * 100)
        return { cat, avg, rate, participants: scores.length }
      }),
    [students],
  )

  const sevenDaysAgo = Date.now() - 7 * 86_400_000
  const recentPlays = useMemo(() => rankings.filter((r) => r.savedAt >= sevenDaysAgo), [rankings, sevenDaysAgo])
  const activeCount = useMemo(() => new Set(recentPlays.map((r) => r.nickname)).size, [recentPlays])

  const attentionStudents = useMemo(
    () =>
      students.filter((s) => {
        const inactive = daysSince(s.lastPlayedAt) >= 7
        const lowTotal = s.total < avgTotal * 0.6
        const weakCount = CATEGORIES.filter((cat) => {
          const score = s.scores[cat]
          const catAvg = catStats.find((c) => c.cat === cat)?.avg ?? 0
          return score !== undefined && score < catAvg
        }).length
        return inactive || lowTotal || weakCount >= 2
      }),
    [students, avgTotal, catStats],
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '📊 현황' },
    { id: 'ranking', label: '🏅 순위' },
    { id: 'analysis', label: '📈 분석' },
    { id: 'attention', label: `⚠️ 주의 ${attentionStudents.length > 0 ? `(${attentionStudents.length})` : ''}` },
  ]

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight">👨‍🏫 선생님 모드</h1>
            <button
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white text-sm transition"
            >
              ← 홈으로
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/15 rounded-xl py-2 px-1">
              <p className="text-2xl font-extrabold">{students.length}</p>
              <p className="text-xs opacity-75 mt-0.5">참여 학생</p>
            </div>
            <div className="bg-white/15 rounded-xl py-2 px-1">
              <p className="text-2xl font-extrabold">{rankings.length}</p>
              <p className="text-xs opacity-75 mt-0.5">총 플레이</p>
            </div>
            <div className="bg-white/15 rounded-xl py-2 px-1">
              <p className="text-2xl font-extrabold">{activeCount}</p>
              <p className="text-xs opacity-75 mt-0.5">이번 주 활동</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === id
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-12">
        {/* ── 현황 탭 ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {students.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="반 평균 (종합)" value={`${avgTotal}점`} sub="카테고리 최고점 합산" />
                  <StatCard
                    label="1위"
                    value={students[0].nickname}
                    sub={`${students[0].total}점`}
                  />
                </div>

                {/* 카테고리별 1위 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <h3 className="font-bold text-slate-700 mb-3 text-sm">카테고리별 최고점</h3>
                  <div className="space-y-2.5">
                    {CATEGORIES.map((cat) => {
                      const best = students
                        .filter((s) => s.scores[cat] !== undefined)
                        .sort((a, b) => (b.scores[cat] ?? 0) - (a.scores[cat] ?? 0))[0]
                      return (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            {CAT_EMOJI[cat]} {cat}
                          </span>
                          {best ? (
                            <span className="text-sm font-semibold text-slate-700">
                              {best.nickname}{' '}
                              <span className="text-emerald-600 font-bold">{best.scores[cat]}점</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">기록 없음</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 최근 7일 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <h3 className="font-bold text-slate-700 mb-2 text-sm">최근 7일 활동</h3>
                  <div className="flex gap-4 text-sm">
                    <span>
                      활동{' '}
                      <span className="font-bold text-emerald-600">{activeCount}명</span>
                    </span>
                    <span>
                      비활동{' '}
                      <span className="font-bold text-rose-500">
                        {students.length - activeCount}명
                      </span>
                    </span>
                    <span>
                      플레이{' '}
                      <span className="font-bold text-slate-700">{recentPlays.length}회</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 순위 탭 ── */}
        {activeTab === 'ranking' && (
          <div className="space-y-2">
            {students.length === 0 ? (
              <EmptyState />
            ) : (
              students.map((s, i) => (
                <div
                  key={s.nickname}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 text-center flex-shrink-0 text-xl">
                      {i < 3 ? (
                        MEDALS[i]
                      ) : (
                        <span className="text-slate-400 font-bold text-sm">{i + 1}</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{s.nickname}</p>
                      <p className="text-xs text-slate-400">
                        {s.playCount}회 플레이 · 최근{' '}
                        {daysSince(s.lastPlayedAt) === 0
                          ? '오늘'
                          : `${daysSince(s.lastPlayedAt)}일 전`}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-600 flex-shrink-0">
                      {s.total}점
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-11">
                    {CATEGORIES.map(
                      (cat) =>
                        s.scores[cat] !== undefined && (
                          <span
                            key={cat}
                            className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                          >
                            {cat} {s.scores[cat]}
                          </span>
                        ),
                    )}
                    {s.scores.all !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                        전체도전 {s.scores.all}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 분석 탭 ── */}
        {activeTab === 'analysis' && (
          <div className="space-y-3">
            {catStats.map(({ cat, avg, rate, participants }) => {
              const status =
                rate >= 70 ? '✅ 양호' : rate >= 50 ? '⚠️ 주의' : '❌ 취약'
              const barColor =
                rate >= 70 ? 'bg-emerald-400' : rate >= 50 ? 'bg-amber-400' : 'bg-rose-400'
              return (
                <div
                  key={cat}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {CAT_EMOJI[cat]} {cat}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        참여 {participants}명 · 평균 {avg}점 / {CATEGORY_MAX}점
                      </p>
                    </div>
                    <span className="text-sm font-semibold">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-3">
                      <div
                        className={`${barColor} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-10 text-right">
                      {rate}%
                    </span>
                  </div>
                </div>
              )
            })}

            {/* 요약 코멘트 */}
            {students.length > 0 && (() => {
              const sorted = [...catStats].sort((a, b) => b.rate - a.rate)
              const best = sorted[0]
              const worst = sorted[sorted.length - 1]
              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-emerald-800 mb-1.5">📋 분석 요약</p>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    최고 달성률: <b>{best.cat}</b> ({best.rate}%)
                    <br />
                    집중 보완 카테고리: <b>{worst.cat}</b> ({worst.rate}%)
                  </p>
                </div>
              )
            })()}
          </div>
        )}

        {/* ── 주의 학생 탭 ── */}
        {activeTab === 'attention' && (
          <div className="space-y-3">
            {attentionStudents.length === 0 ? (
              <div className="text-center text-slate-400 mt-24">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-semibold text-slate-600">전체 학생 정상 참여 중</p>
                <p className="text-sm mt-1">특별 조치가 필요한 학생이 없습니다.</p>
              </div>
            ) : (
              attentionStudents.map((s) => {
                const inactive = daysSince(s.lastPlayedAt) >= 7
                const lowTotal = s.total < avgTotal * 0.6
                const weakCats = CATEGORIES.filter((cat) => {
                  const score = s.scores[cat]
                  const catAvg = catStats.find((c) => c.cat === cat)?.avg ?? 0
                  return score !== undefined && score < catAvg
                })
                const tags: string[] = []
                if (inactive) tags.push(`${daysSince(s.lastPlayedAt)}일 미활동`)
                if (lowTotal) tags.push('종합점수 부족')
                if (weakCats.length >= 2) tags.push(`${weakCats.length}개 카테고리 평균 미달`)

                return (
                  <div
                    key={s.nickname}
                    className="bg-white border-l-4 border-amber-400 rounded-2xl shadow-sm p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{s.nickname}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          마지막 플레이: {fmtDate(s.lastPlayedAt)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{s.total}점</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {weakCats.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        취약 카테고리: {weakCats.join(', ')}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-extrabold text-slate-800 truncate">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center text-slate-400 mt-24">
      <p className="text-4xl mb-3">📭</p>
      <p className="font-semibold">아직 기록이 없습니다.</p>
      <p className="text-sm mt-1">학생들이 퀴즈를 풀면 여기에 표시됩니다.</p>
    </div>
  )
}
