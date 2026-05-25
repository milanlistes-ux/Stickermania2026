import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { getUserId, getDisplayName, getLocalStickers, fetchRemoteUser, applyTrade } from '../../lib/userStore'
import { isOnline } from '../../lib/supabase'
import { SECTIONS } from '../../data/album'
import SwapResult from './SwapResult'
import QRScanner from './QRScanner'

export default function TradeView() {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [mode, setMode] = useState('show') // 'show' | 'scan' | 'result'
  const [partnerData, setPartnerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const userId = getUserId()
  const displayName = getDisplayName()

  const shareUrl = `${window.location.origin}${window.location.pathname}?trade=${userId}`

  useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 220, margin: 2, color: { dark: '#1E3A8A' } })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [shareUrl])

  // Handle incoming trade URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const traderId = params.get('trade')
    if (traderId && traderId !== userId) {
      loadPartner(traderId)
    }
  }, [])

  async function loadPartner(partnerId) {
    if (!isOnline()) {
      setError('No Supabase connection — trade comparison requires internet.')
      return
    }
    setLoading(true)
    setError('')
    const partner = await fetchRemoteUser(partnerId)
    setLoading(false)
    if (!partner) {
      setError('Could not find that user. Make sure both phones are online.')
      return
    }
    setPartnerData(partner)
    setMode('result')
  }

  function handleScan(url) {
    try {
      const u = new URL(url)
      const partnerId = u.searchParams.get('trade')
      if (partnerId) loadPartner(partnerId)
      else setError('QR code did not contain a valid trade link.')
    } catch {
      setError('Invalid QR code.')
    }
  }

  function handleConfirmTrade(given, received) {
    applyTrade(given, received)
    setMode('show')
    setPartnerData(null)
    window.history.replaceState({}, '', window.location.pathname)
  }

  const mySwaps = Object.entries(getLocalStickers())
    .filter(([, s]) => s === 2)
    .map(([code]) => code)

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {mode === 'show' && (
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <div className="bg-white rounded-2xl p-5 w-full shadow-sm mb-5">
            <div className="text-center font-bold text-gray-800 mb-1">Your Trade QR</div>
            <div className="text-center text-sm text-gray-500 mb-4">
              {displayName ? `@${displayName} · ` : ''}{mySwaps.length} sticker{mySwaps.length !== 1 ? 's' : ''} available to swap
            </div>
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrDataUrl} alt="Trade QR Code" className="w-48 h-48 rounded-xl" />
              </div>
            )}
            <button
              onClick={() => navigator.share?.({ url: shareUrl, title: 'StickerMania trade' }).catch(() => navigator.clipboard?.writeText(shareUrl))}
              className="w-full py-2 text-brand text-sm font-semibold border border-brand rounded-xl"
            >
              Share link
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 w-full shadow-sm">
            <div className="text-center font-bold text-gray-800 mb-4">Scan Friend's QR</div>

            <div className="space-y-3 mb-5">
              {[
                "Scan your friend's QR code to discover which stickers you can swap.",
                "See exactly who gives what — both collections update automatically.",
                "Exchange the traded stickers physically.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-none w-7 h-7 rounded-full bg-brand text-white text-sm flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 pt-0.5">{text}</span>
                </div>
              ))}
            </div>

            {!isOnline() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 text-sm text-yellow-700">
                ⚠️ Supabase not configured. Trade comparison requires a database connection.
              </div>
            )}

            {error && <div className="text-red-500 text-sm text-center mb-3">{error}</div>}

            {loading && <div className="text-center text-gray-400 text-sm mb-3">Loading friend's collection…</div>}

            <button
              onClick={() => setMode('scan')}
              disabled={!isOnline() || loading}
              className="w-full py-3 bg-brand text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>⬛</span> Scan QR
            </button>
          </div>
        </div>
      )}

      {mode === 'scan' && (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
            <button onClick={() => setMode('show')} className="text-brand font-semibold">← Back</button>
            <span className="font-semibold text-gray-700">Scan friend's QR</span>
          </div>
          <QRScanner onScan={handleScan} onError={setError} />
        </div>
      )}

      {mode === 'result' && partnerData && (
        <SwapResult
          partner={partnerData}
          myStickers={getLocalStickers()}
          onConfirm={handleConfirmTrade}
          onCancel={() => { setMode('show'); window.history.replaceState({}, '', window.location.pathname) }}
        />
      )}
    </div>
  )
}
