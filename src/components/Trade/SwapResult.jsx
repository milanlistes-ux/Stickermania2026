import { useMemo, useState } from 'react'
import { getSectionForCode } from '../../data/album'

export default function SwapResult({ partner, myStickers, onConfirm, onCancel }) {
  const [selected, setSelected] = useState({ giving: new Set(), receiving: new Set() })

  const { iCanGive, theyCanGive } = useMemo(() => {
    const mySwaps = Object.keys(myStickers).filter(c => myStickers[c] === 2)
    const myMissing = new Set(
      Object.entries(myStickers).filter(([, s]) => s === 0).map(([c]) => c)
    )
    const partnerSwaps = Object.keys(partner.stickers).filter(c => partner.stickers[c] === 2)
    const partnerMissing = new Set(
      Object.entries(partner.stickers).filter(([, s]) => s === 0).map(([c]) => c)
    )

    return {
      iCanGive: mySwaps.filter(c => partnerMissing.has(c)),
      theyCanGive: partnerSwaps.filter(c => myMissing.has(c)),
    }
  }, [partner, myStickers])

  function toggle(type, code) {
    setSelected(prev => {
      const set = new Set(prev[type])
      set.has(code) ? set.delete(code) : set.add(code)
      return { ...prev, [type]: set }
    })
  }

  function confirmTrade() {
    onConfirm([...selected.giving], [...selected.receiving])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={onCancel} className="text-brand font-semibold">← Back</button>
        <span className="font-semibold text-gray-700">Trade with {partner.display_name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 pb-32">
        <TradeList
          title={`You can give ${partner.display_name}`}
          codes={iCanGive}
          selected={selected.giving}
          onToggle={c => toggle('giving', c)}
          emptyMsg="No matching swaps found"
          color="green"
        />
        <TradeList
          title={`${partner.display_name} can give you`}
          codes={theyCanGive}
          selected={selected.receiving}
          onToggle={c => toggle('receiving', c)}
          emptyMsg="No matching swaps found"
          color="blue"
        />
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
        <div className="text-xs text-gray-500 text-center">
          Select stickers to include, then confirm to update both collections
        </div>
        <button
          onClick={confirmTrade}
          disabled={selected.giving.size === 0 && selected.receiving.size === 0}
          className="w-full py-3 bg-brand text-white rounded-xl font-semibold disabled:opacity-40"
        >
          Confirm Trade ({selected.giving.size + selected.receiving.size} stickers)
        </button>
      </div>
    </div>
  )
}

function TradeList({ title, codes, selected, onToggle, emptyMsg, color }) {
  const colors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', chip: 'bg-green-100 border-green-300', sel: 'bg-green-500 text-white border-green-600' },
    blue:  { bg: 'bg-blue-50',  border: 'border-blue-200',  chip: 'bg-blue-100 border-blue-300',   sel: 'bg-blue-500 text-white border-blue-600' },
  }
  const c = colors[color]

  return (
    <div className={`${c.bg} rounded-2xl p-4 border ${c.border}`}>
      <div className="font-semibold text-gray-700 mb-3 text-sm">{title} ({codes.length})</div>
      {codes.length === 0 ? (
        <div className="text-gray-400 text-sm">{emptyMsg}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {codes.map(code => {
            const section = getSectionForCode(code)
            const num = code.replace(section?.id || '', '')
            const isSel = selected.has(code)
            return (
              <button
                key={code}
                onClick={() => onToggle(code)}
                className={`rounded-full border-2 px-3 py-1 text-sm font-semibold transition-all
                  ${isSel ? c.sel : `${c.chip} text-gray-700`}`}
                title={code}
              >
                {section?.emoji} {code}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
