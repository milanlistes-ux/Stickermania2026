import { useState, useEffect } from 'react'
import AlbumView from './components/Album/AlbumView'
import StatsView from './components/Stats/StatsView'
import TradeView from './components/Trade/TradeView'
import SettingsView from './components/Settings/SettingsView'
import BottomNav from './components/BottomNav'
import InputModal from './components/Input/InputModal'
import { getUserId, pullFromRemote, pushToRemote } from './lib/userStore'

export default function App() {
  const [tab, setTab] = useState('album')
  const [showInput, setShowInput] = useState(false)

  // If arriving via a trade URL, jump to Trade tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('trade')) setTab('trade')
  }, [])

  // On first load: ensure user exists, pull remote data
  useEffect(() => {
    getUserId()
    pullFromRemote().catch(() => {})
  }, [])

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe pt-3 pb-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="font-bold text-gray-900 leading-tight text-base">StickerMania</div>
            <div className="text-xs text-gray-400 leading-tight">FIFA WC 2026</div>
          </div>
        </div>
        <button
          onClick={() => setShowInput(true)}
          className="bg-brand text-white text-sm font-semibold px-4 py-1.5 rounded-xl"
        >
          + Add
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {tab === 'album'    && <AlbumView onOpenInput={() => setShowInput(true)} />}
        {tab === 'stats'    && <StatsView />}
        {tab === 'trade'    && <TradeView />}
        {tab === 'settings' && <SettingsView />}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {showInput && <InputModal onClose={() => setShowInput(false)} />}
    </div>
  )
}
