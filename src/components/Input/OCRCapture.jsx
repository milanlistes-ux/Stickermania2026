import { useState, useRef } from 'react'
import { parseCode } from '../../data/album'
import { setStickerStatus, getStickerStatus } from '../../lib/userStore'

// Preprocess: grayscale + invert-threshold at given level, upscale for OCR
async function preprocessImage(file, threshold = 110) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.max(1, 2400 / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        // Invert: dark badge bg → white, badge text → black (OCR-friendly)
        const val = gray < threshold ? 255 : 0
        d[i] = d[i + 1] = d[i + 2] = val
        d[i + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob) }, 'image/png')
    }
    img.src = url
  })
}

// Rotate a blob by 0/90/180/270 degrees
async function rotateBlob(blob, degrees) {
  if (degrees === 0) return blob
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const swap = degrees === 90 || degrees === 270
      const canvas = document.createElement('canvas')
      canvas.width  = swap ? img.height : img.width
      canvas.height = swap ? img.width  : img.height
      const ctx = canvas.getContext('2d')
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((degrees * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob) }, 'image/png')
    }
    img.src = url
  })
}

function extractCodes(text) {
  const found = new Set()
  const matches = [...text.matchAll(/([A-Z]{2,3})\s*(\d{1,2})/g)]
  for (const m of matches) {
    const code = parseCode(`${m[1]}${m[2]}`)
    if (code) found.add(code)
  }
  return found
}

export default function OCRCapture({ onClose }) {
  const [status, setStatus]   = useState('idle')
  const [results, setResults] = useState([])
  const [error, setError]     = useState('')
  const [progress, setProgress] = useState({ step: 0, total: 0, label: '' })
  const fileRef = useRef()

  async function processImage(file) {
    setStatus('scanning')
    setError('')

    try {
      const { createWorker } = await import('tesseract.js')

      // Build all image blobs to scan:
      // thresholds 80 & 120 × rotations 0°/90°/180°/270° = 8 preprocessed
      // + original image at 0°/90° = 2
      // Total = 10 passes, 1 worker reused throughout
      const thresholds = [80, 120]
      const rotations  = [0, 90, 180, 270]

      const blobs = []
      setProgress({ step: 0, total: 0, label: 'Preparing images…' })

      for (const t of thresholds) {
        const pre = await preprocessImage(file, t)
        for (const r of rotations) {
          blobs.push(await rotateBlob(pre, r))
        }
      }
      // Also include the original (no threshold inversion) at 0° and 90°
      for (const r of [0, 90]) {
        blobs.push(await rotateBlob(file, r))
      }

      const total = blobs.length
      setProgress({ step: 0, total, label: 'Starting OCR…' })

      const worker = await createWorker('eng', 1, { logger: () => {} })
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
        tessedit_pageseg_mode: '11', // sparse text — best for multi-sticker layouts
      })

      const allCodes = new Set()
      for (let i = 0; i < blobs.length; i++) {
        setProgress({ step: i + 1, total, label: `Scanning pass ${i + 1} of ${total}…` })
        const { data: { text } } = await worker.recognize(blobs[i])
        for (const code of extractCodes(text)) allCodes.add(code)
      }

      await worker.terminate()

      if (allCodes.size === 0) {
        setError(
          'No sticker codes found. Tips: lay stickers flat with badges visible, use good lighting, avoid heavy shadows.'
        )
        setStatus('error')
      } else {
        const mapped = [...allCodes].map(code => {
          const existing = getStickerStatus(code)
          const auto = existing === 0 ? 1 : 2   // new → Have, duplicate → Swap
          setStickerStatus(code, auto)
          return { code, current: auto }
        })
        setResults(mapped)
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
            <div className="text-sm text-gray-500 mb-3">
              The dark badge in the upper-right (e.g. <strong>SWE 1</strong>) is detected automatically — even on rotated stickers.
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 text-left space-y-1">
              <div>✅ Good lighting, flat surface</div>
              <div>✅ All badges clearly visible, not overlapping</div>
              <div>✅ Rotated stickers are handled automatically</div>
              <div>⏱ ~30 sec for 6+ stickers (10-pass scan)</div>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 bg-brand text-white rounded-xl font-semibold"
          >
            Open Camera
          </button>
          <button
            onClick={() => {
              const input = fileRef.current
              input.removeAttribute('capture')
              input.click()
              setTimeout(() => input.setAttribute('capture', 'environment'), 500)
            }}
            className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold"
          >
            Choose from Gallery
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <div className="flex flex-col items-center pt-12 gap-5">
          <div className="w-14 h-14 rounded-full border-4 border-brand border-t-transparent animate-spin" />
          <div className="text-gray-700 font-semibold text-center">{progress.label}</div>
          {progress.total > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-brand h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.step / progress.total) * 100}%` }}
              />
            </div>
          )}
          <div className="text-xs text-gray-400 text-center">
            Scanning {progress.total} image variations (different angles &amp; contrast levels) to maximise accuracy
          </div>
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
          <div className="text-sm text-gray-500 mb-3">
            Found <strong>{results.length}</strong> sticker{results.length !== 1 ? 's' : ''} — auto-marked below. Tap any to correct.
          </div>
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
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all
            ${status === s ? cls + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-gray-100 text-gray-400'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
