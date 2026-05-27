import { useState, useMemo, useRef } from 'react'
import { SECTIONS } from '../../data/album'
import { getStickerStatus, setStickerStatus } from '../../lib/userStore'

const STATUS_STYLE = [
  'bg-yellow-50 border-yellow-300 text-yellow-700',
  'bg-blue-200 border-blue-400 text-blue-900 font-bold',
  'bg-green-200 border-green-400 text-green-900 font-bold',
]
const STATUS_LABEL = ['—', '✓', '⇄']

export default function ManualSearch({ onClose }) {
  const [query, setQuery]               = useState('')
  const [selected, setSelected]         = useState(null)
  const [updated, setUpdated]           = useState({})
  const [inputKey, setInputKey]         = useState(0) // increment to force-remount input
  const inputRef = useRef()

  const suggestions = useMemo(() => {
    if (!query.trim() || selected) return []
    const q = query.toUpperCase().trim()
    return SECTIONS.filter(s =>
      s.id.startsWith(q) || s.name?.toUpperCase().includes(q)
    ).slice(0, 12)
  }, [query, selected])

  function pickSection(section) {
    setSelected(section)
    setQuery(section.id)
  }

  function backToSearch() {
    setSelected(null)
    setQuery('')
    setInputKey(k => k + 1) // force fresh input element so iOS shows it empty
  }

  function getStatus(code) {
    return updated[code] ?? getStickerStatus(code)
  }

  function cycle(code) {
    const cur = getStatus(code)
    const next = cur === 0 ? 1 : cur === 1 ? 2 : 0
    setStickerStatus(code, next)
    setUpdated(p => ({ ...p, [code]: next }))
  }

  const stickers = selected
    ? (selected.subsections
        ? selected.subsections.flatMap(s => s.stickers)
        : selected.stickers)
    : []

  const haveCount  = stickers.filter(n => getStatus(`${selected?.id}${n}`) === 1).length
  const swapCount  = stickers.filter(n => getStatus(`${selected?.id}${n}`) === 2).length

  return (
    <div className="flex flex-col h-full">
      {/* ── Step 1: country search ── */}
      {!selected && (
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 gap-2">
            <span className="text-gray-400">🔍</span>
            <input
              key={inputKey}
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent py-3 text-sm outline-none"
              placeholder="Type country code or name (e.g. NED, Austria…)"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 text-lg">×</button>
            )}
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.map(section => (
                <button
                  key={section.id}
                  onClick={() => pickSection(section)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
                >
                  <span className="text-2xl">{section.emoji}</span>
                  <span className="font-bold text-gray-800">{section.id}</span>
                  <span className="text-sm text-gray-500">{section.name}</span>
                  <span className="ml-auto text-gray-300">›</span>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center text-gray-400 py-6">No countries match "{query}"</div>
          ) : (
            <div className="text-center text-gray-300 py-6 text-sm">Start typing to find a country</div>
          )}
        </div>
      )}

      {/* ── Step 2: number grid (no keyboard needed) ── */}
      {selected && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
            <button onClick={backToSearch} className="text-brand font-semibold text-sm">← Back</button>
            <span className="text-xl">{selected.emoji}</span>
            <span className="font-bold text-gray-800">{selected.id}</span>
            <span className="text-sm text-gray-400 flex-1">{selected.name}</span>
            <span className="text-xs text-blue-600 font-semibold">{haveCount} have</span>
            <span className="text-xs text-green-600 font-semibold ml-1">{swapCount} swap</span>
          </div>

          {/* Legend */}
          <div className="flex gap-4 px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 bg-yellow-50 border-yellow-300 inline-block"/>Missing</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 bg-blue-200 border-blue-400 inline-block"/>Have</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 bg-green-200 border-green-400 inline-block"/>Swap</span>
            <span className="ml-auto text-gray-400">tap to cycle</span>
          </div>

          {/* Number grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {stickers.map(n => {
                const code = `${selected.id}${n}`
                const status = getStatus(code)
                return (
                  <button
                    key={n}
                    onClick={() => cycle(code)}
                    className={`
                      h-12 rounded-xl border-2 text-sm font-bold transition-all active:scale-90
                      ${STATUS_STYLE[status]}
                    `}
                  >
                    <div className="leading-none">{n}</div>
                    <div className="text-xs opacity-60 mt-0.5">{STATUS_LABEL[status]}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button onClick={onClose} className="w-full py-3 bg-brand text-white rounded-xl font-semibold">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
