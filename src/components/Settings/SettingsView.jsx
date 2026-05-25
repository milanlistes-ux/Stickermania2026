import { useState } from 'react'
import { getUserId, getDisplayName, setDisplayName, pushToRemote } from '../../lib/userStore'
import { isOnline } from '../../lib/supabase'

export default function SettingsView() {
  const [name, setName] = useState(getDisplayName)
  const [saved, setSaved] = useState(false)
  const [synced, setSynced] = useState(false)
  const userId = getUserId()

  function saveName() {
    setDisplayName(name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function syncNow() {
    await pushToRemote()
    setSynced(true)
    setTimeout(() => setSynced(false), 2000)
  }

  function copyId() {
    navigator.clipboard?.writeText(userId)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
      {/* Profile */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="font-semibold text-gray-700 mb-3">Your Profile</div>
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Display name (shown to trade partners)</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand"
            placeholder="e.g. Milan"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <button
          onClick={saveName}
          className="w-full py-2.5 bg-brand text-white rounded-xl text-sm font-semibold"
        >
          {saved ? '✓ Saved!' : 'Save Name'}
        </button>
      </div>

      {/* User ID */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="font-semibold text-gray-700 mb-1">Your ID</div>
        <div className="text-xs text-gray-400 mb-2">
          This is your unique identifier. Your collection is tied to this ID and stored in this browser. If you switch devices, export your data and import on the new device.
        </div>
        <div className="flex gap-2 items-center bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs font-mono text-gray-500 flex-1 break-all">{userId}</span>
          <button onClick={copyId} className="text-brand text-xs font-semibold flex-none">Copy</button>
        </div>
      </div>

      {/* Sync */}
      {isOnline() && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="font-semibold text-gray-700 mb-1">Sync to Cloud</div>
          <div className="text-xs text-gray-400 mb-3">Push your local collection to the database so trade partners can see your swap list.</div>
          <button
            onClick={syncNow}
            className="w-full py-2.5 border border-brand text-brand rounded-xl text-sm font-semibold"
          >
            {synced ? '✓ Synced!' : 'Sync Now'}
          </button>
        </div>
      )}

      {!isOnline() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          <strong>Offline mode</strong> — data is stored locally only. To enable QR trades, add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables.
        </div>
      )}

      {/* About */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="font-semibold text-gray-700 mb-2">How sticker states work</div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex gap-3"><span className="w-24 font-medium text-yellow-700">1 tap</span>Mark as <strong>Have</strong></div>
          <div className="flex gap-3"><span className="w-24 font-medium text-green-700">2 taps</span>Mark as <strong>Swap</strong> (duplicate)</div>
          <div className="flex gap-3"><span className="w-24 font-medium text-gray-500">Long hold</span>Step back one state</div>
        </div>
      </div>
    </div>
  )
}
