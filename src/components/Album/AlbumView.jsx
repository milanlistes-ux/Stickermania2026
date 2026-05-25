import { useState, useCallback } from 'react'
import { SECTIONS } from '../../data/album'
import { getLocalStickers } from '../../lib/userStore'
import SectionGroup from './SectionGroup'

const TABS = ['all', 'need', 'swap']

export default function AlbumView({ onOpenInput }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [stickers, setStickers] = useState(() => getLocalStickers())

  const handleUpdate = useCallback(() => {
    setStickers(getLocalStickers())
  }, [])

  const filtered = search
    ? SECTIONS.filter(s =>
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.name?.toLowerCase().includes(search.toLowerCase())
      )
    : SECTIONS

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors
              ${filter === t ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 gap-2">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            className="flex-1 bg-transparent py-2 text-sm outline-none"
            placeholder="Search country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={onOpenInput}
          className="bg-brand text-white rounded-xl px-4 text-sm font-semibold"
        >
          + Add
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200 inline-block"/>Missing</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-300 inline-block"/>Have</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-200 border border-green-300 inline-block"/>Swap</span>
        <span className="ml-auto text-gray-400">long-hold = undo</span>
      </div>

      {/* Sticker groups */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {filtered.map(section => (
          <SectionGroup
            key={section.id}
            section={section}
            stickers={stickers}
            filter={filter}
            onUpdate={handleUpdate}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-16">No sections match your search</div>
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}
