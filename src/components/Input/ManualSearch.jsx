import { useState, useMemo, useRef } from 'react'
import { SECTIONS } from '../../data/album'
import { getStickerStatus, setStickerStatus } from '../../lib/userStore'

export default function ManualSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const [updated, setUpdated] = useState({})
  const [lastAdded, setLastAdded] = useState(null)
  const inputRef = useRef()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toUpperCase().trim()
    const matches = []
    for (const section of SECTIONS) {
      const stickers = section.subsections
        ? section.subsections.flatMap(s => s.stickers)
        : section.stickers
      if (section.id.startsWith(q) || section.name?.toUpperCase().includes(q)) {
        // Return all stickers for matching section (capped at 20)
        for (const n of stickers.slice(0, 20)) {
          matches.push({ code: `${section.id}${n}`, section })
          if (matches.length >= 40) return matches
        }
      } else {
        // Check individual sticker codes
        for (const n of stickers) {
          const code = `${section.id}${n}`
          if (code.startsWith(q)) {
            matches.push({ code, section })
            if (matches.length >= 40) return matches
          }
        }
      }
    }
    return matches
  }, [query])

  function getStatus(code) {
    return updated[code] ?? getStickerStatus(code)
  }

  function cycle(code) {
    const cur = getStatus(code)
    const next = (cur + 1) % 3
    setStickerStatus(code, next)
    setUpdated(p => ({ ...p, [code]: next }))
    // Clear search and keep keyboard open for rapid entry
    setLastAdded(code)
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="p-4">
      <div className="flex items-center bg-gray-100 rounded-xl px-3 gap-2 mb-1">
        <span className="text-gray-400">🔍</span>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent py-3 text-sm outline-none"
          placeholder="Type code or country (e.g. AUT, NED…)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && <button onClick={() => { setQuery(''); inputRef.current?.focus() }} className="text-gray-400 text-lg">×</button>}
      </div>

      {lastAdded && !query && (
        <div className="text-xs text-green-600 mb-2 px-1 font-semibold">✓ {lastAdded} added — type next code</div>
      )}

      <div className="text-xs text-gray-400 mb-3 px-1">
        Tap a sticker to cycle: <span className="text-yellow-600">Missing</span> → <span className="text-blue-600">Have</span> → <span className="text-green-600">Swap</span>
      </div>

      {results.length > 0 ? (
        <div className="space-y-1">
          {results.map(({ code, section }) => {
            const status = getStatus(code)
            const num = code.replace(section.id, '')
            const styles = [
              'bg-yellow-50 border-yellow-200 text-yellow-700',
              'bg-blue-100 border-blue-300 text-blue-800 font-bold',
              'bg-green-100 border-green-300 text-green-800 font-bold',
            ]
            const labels = ['Missing', 'Have', 'Swap']
            return (
              <button
                key={code}
                onPointerDown={e => e.preventDefault()}
                onClick={() => cycle(code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${styles[status]}`}
              >
                <span className="text-xl">{section.emoji}</span>
                <span className="font-mono font-bold text-base">{code}</span>
                <span className="text-sm opacity-70">{section.name}</span>
                <span className="ml-auto text-xs font-semibold">{labels[status]}</span>
              </button>
            )
          })}
        </div>
      ) : query.trim() ? (
        <div className="text-center text-gray-400 py-8">No stickers found for "{query}"</div>
      ) : (
        <div className="text-center text-gray-300 py-8 text-sm">Start typing to search…</div>
      )}

      <div className="mt-4">
        <button onClick={onClose} className="w-full py-3 bg-brand text-white rounded-xl font-semibold">Done</button>
      </div>
    </div>
  )
}
