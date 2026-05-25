import { useState } from 'react'
import StickerChip from './StickerChip'

export default function SectionGroup({ section, stickers, filter, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false)

  // For FWC with subsections
  if (section.subsections) {
    return (
      <div className="mb-4">
        {section.subsections.map(sub => {
          const chips = sub.stickers
            .map(n => ({ code: `${section.id}${n}`, number: n, status: stickers[`${section.id}${n}`] ?? 0 }))
            .filter(c => filterMatch(c.status, filter))
          if (chips.length === 0) return null
          return (
            <SubSection key={sub.label} label={sub.label} chips={chips} onUpdate={onUpdate} />
          )
        })}
      </div>
    )
  }

  const chips = section.stickers
    .map(n => ({ code: `${section.id}${n}`, number: n, status: stickers[`${section.id}${n}`] ?? 0 }))
    .filter(c => filterMatch(c.status, filter))

  if (chips.length === 0) return null

  const haveCount = section.stickers.filter(n => (stickers[`${section.id}${n}`] ?? 0) > 0).length

  return (
    <div className="mb-4">
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-white"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{section.emoji}</span>
          <span className="font-semibold text-gray-800">{section.id}</span>
          <span className="text-sm text-gray-400">{section.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{haveCount}/{section.stickers.length}</span>
          <span className="text-gray-400 text-xs">{collapsed ? '▼' : '▲'}</span>
        </div>
      </button>
      {!collapsed && (
        <div className="flex flex-wrap gap-2 px-4 pt-1 pb-3">
          {chips.map(({ code, number, status }) => (
            <StickerChip key={code} code={code} number={number} status={status} onChange={onUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubSection({ label, chips, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="mb-3">
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-white"
        onClick={() => setCollapsed(v => !v)}
      >
        <span className="font-semibold text-gray-700 text-sm">{label}</span>
        <span className="text-gray-400 text-xs">{collapsed ? '▼' : '▲'}</span>
      </button>
      {!collapsed && (
        <div className="flex flex-wrap gap-2 px-4 pt-1 pb-2">
          {chips.map(({ code, number, status }) => (
            <StickerChip key={code} code={code} number={number} status={status} onChange={onUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

function filterMatch(status, filter) {
  if (filter === 'all') return true
  if (filter === 'need') return status === 0
  if (filter === 'swap') return status === 2
  return true
}
