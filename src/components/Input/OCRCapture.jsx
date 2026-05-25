import { useState, useRef } from 'react'
import { parseCode } from '../../data/album'
import { setStickerStatus, getStickerStatus } from '../../lib/userStore'

export default function OCRCapture({ onClose }) {
  const [status, setStatus] = useState('idle') // idle | scanning | results | error
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const fileRef = useRef()

  async function processImage(file) {
    setStatus('scanning')
    setError('')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: () => {}
      })
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      // Extract sticker codes from OCR text
      // Pattern: 2-3 uppercase letters followed by 1-2 digits, e.g. "AUT 18", "BRA5"
      const raw = text.toUpperCase()
      const matches = [...raw.matchAll(/\b([A-Z]{2,3})\s*(\d{1,2})\b/g)]
      const found = []
      const seen = new Set()
      for (const m of matches) {
        const candidate = `${m[1]}${m[2]}`
        const code = parseCode(candidate)
        if (code && !seen.has(code)) {
          seen.add(code)
          found.push({ code, current: getStickerStatus(code) })
        }
      }

      if (found.length === 0) {
        setError('No sticker codes found in image. Try a clearer photo of the sticker back.')
        setStatus('error')
      } else {
        setResults(found)
        setStatus('results')
      }
    } catch (e) {
      setError('OCR failed: ' + e.message)
      setStatus('error')
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  function handleCamera() {
    fileRef.current?.click()
  }

  function setCode(code, newStatus) {
    setStickerStatus(code, newStatus)
    setResults(prev => prev.map(r => r.code === code ? { ...r, current: newStatus } : r))
  }

  return (
    <div className="p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {status === 'idle' && (
        <div className="flex flex-col items-center pt-6 gap-4">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-5xl">📷</div>
          <div className="text-center">
            <div className="font-semibold text-gray-800 mb-1">Scan sticker backs</div>
            <div className="text-sm text-gray-500">Point camera at the back of your sticker. The code (e.g. <strong>AUT 18</strong>) will be detected automatically.</div>
          </div>
          <button
            onClick={handleCamera}
            className="w-full py-3 bg-brand text-white rounded-xl font-semibold"
          >
            Open Camera
          </button>
          <button
            onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click() }}
            className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold"
          >
            Choose from Gallery
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <div className="flex flex-col items-center pt-12 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand border-t-transparent animate-spin" />
          <div className="text-gray-500">Scanning sticker codes…</div>
        </div>
      )}

      {status === 'error' && (
        <div className="pt-6">
          <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600 mb-4">{error}</div>
          <button onClick={() => setStatus('idle')} className="w-full py-3 bg-brand text-white rounded-xl font-semibold">Try Again</button>
        </div>
      )}

      {status === 'results' && (
        <div>
          <div className="text-sm text-gray-500 mb-3">Found {results.length} sticker{results.length !== 1 ? 's' : ''}. Tap to mark as <span className="text-blue-600 font-semibold">Have</span> or <span className="text-green-600 font-semibold">Swap</span>.</div>
          <div className="space-y-2 mb-4">
            {results.map(({ code, current }) => (
              <div key={code} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                <span className="font-mono font-bold text-gray-800 flex-1">{code}</span>
                <StatusToggle status={current} onChange={s => setCode(code, s)} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStatus('idle')} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold">Scan More</button>
            <button onClick={onClose} className="flex-1 py-3 bg-brand text-white rounded-xl font-semibold">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusToggle({ status, onChange }) {
  const opts = [
    { s: 0, label: '✕ Missing', cls: 'bg-gray-100 text-gray-500' },
    { s: 1, label: '✓ Have',    cls: 'bg-blue-100 text-blue-700' },
    { s: 2, label: '⇄ Swap',   cls: 'bg-green-100 text-green-700' },
  ]
  return (
    <div className="flex gap-1">
      {opts.map(({ s, label, cls }) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${status === s ? cls + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-gray-100 text-gray-400'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
