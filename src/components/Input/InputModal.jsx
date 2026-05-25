import { useState } from 'react'
import OCRCapture from './OCRCapture'
import ManualSearch from './ManualSearch'
import CSVImport from './CSVImport'

const TABS = [
  { id: 'camera', label: '📷 Camera' },
  { id: 'manual', label: '🔍 Search' },
  { id: 'csv',    label: '📄 Import' },
]

export default function InputModal({ onClose }) {
  const [tab, setTab] = useState('camera')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-200">
        <span className="font-bold text-gray-800 text-lg">Add Stickers</span>
        <button onClick={onClose} className="text-2xl text-gray-400 leading-none">×</button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors
              ${tab === t.id ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'camera' && <OCRCapture onClose={onClose} />}
        {tab === 'manual' && <ManualSearch onClose={onClose} />}
        {tab === 'csv' && <CSVImport onClose={onClose} />}
      </div>
    </div>
  )
}
