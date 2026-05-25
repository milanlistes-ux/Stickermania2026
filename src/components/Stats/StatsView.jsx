import { useMemo } from 'react'
import { getLocalStickers } from '../../lib/userStore'
import { ALL_STICKER_CODES, TOTAL_STICKERS, SECTIONS } from '../../data/album'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PROGRESS_KEY = 'sm2026_progress_log'

function logProgress(count) {
  const log = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')
  const today = new Date().toISOString().slice(0, 10)
  const last = log[log.length - 1]
  if (!last || last.date !== today) {
    log.push({ date: today, count })
    if (log.length > 90) log.shift()
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(log))
  }
}

function getProgressLog() {
  return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')
}

export default function StatsView() {
  const stickers = getLocalStickers()

  const stats = useMemo(() => {
    const codes = Object.keys(stickers)
    const have = codes.filter(c => stickers[c] >= 1).length
    const swaps = codes.filter(c => stickers[c] === 2).length
    const missing = TOTAL_STICKERS - have
    const pct = Math.round((have / TOTAL_STICKERS) * 100)
    logProgress(have)
    return { have, swaps, missing, pct }
  }, [])

  const progressLog = getProgressLog()

  // Per-section completion for top incomplete sections
  const sectionStats = useMemo(() => {
    return SECTIONS.map(s => {
      const all = s.subsections
        ? s.subsections.flatMap(sub => sub.stickers.map(n => `${s.id}${n}`))
        : s.stickers.map(n => `${s.id}${n}`)
      const have = all.filter(c => (stickers[c] ?? 0) >= 1).length
      return { id: s.id, emoji: s.emoji || '', name: s.name || s.id, total: all.length, have, pct: Math.round((have / all.length) * 100) }
    }).sort((a, b) => a.pct - b.pct)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-4">
      {/* Header card */}
      <div className="bg-white m-4 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#2563EB" strokeWidth="3"
                strokeDasharray={`${stats.pct} ${100 - stats.pct}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-brand">
              {stats.pct}%
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">FIFA WC 2026</div>
            <div className="text-2xl font-bold text-gray-900">{stats.have} <span className="text-gray-400 text-base font-normal">/ {TOTAL_STICKERS}</span></div>
            <div className="text-sm text-gray-500">stickers collected</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Missing" value={stats.missing} color="text-red-500" bg="bg-red-50" />
          <StatCard label="Swaps" value={stats.swaps} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Complete" value={`${stats.pct}%`} color="text-brand" bg="bg-blue-50" />
        </div>
      </div>

      {/* Progress chart */}
      {progressLog.length > 1 && (
        <div className="bg-white mx-4 mb-4 rounded-2xl p-4 shadow-sm">
          <div className="font-semibold text-gray-700 mb-3">Collection Progress</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={progressLog} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [v, 'Stickers']} labelFormatter={l => l} />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Least complete sections */}
      <div className="bg-white mx-4 rounded-2xl p-4 shadow-sm">
        <div className="font-semibold text-gray-700 mb-3">Section Completion</div>
        <div className="space-y-2">
          {sectionStats.map(s => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="text-base w-6">{s.emoji}</span>
              <span className="text-sm text-gray-600 w-10 font-mono">{s.id}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-brand rounded-full h-2 transition-all"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">{s.have}/{s.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
