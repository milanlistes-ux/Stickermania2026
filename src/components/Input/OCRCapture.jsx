import { useState, useRef } from 'react'
import { parseCode } from '../../data/album'
import { setStickerStatus, getStickerStatus } from '../../lib/userStore'

export default function OCRCapture({ onClose }) {
  const [status, setStatus] = useState('idle') // idle | scanning | results | error
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const fileRef = useRef()

  // Preprocess image: upscale + invert dark badge areas so white-on-dark becomes black-on-white
  async function preprocessImage(file) {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        // Upscale to at least 2400px on long side for better OCR on small badges
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
          // Invert: very dark pixels (badge background) → white
          //         lighter pixels (badge text, card bg)  → black
          // This turns white-on-dark badge text into black-on-white → OCR-friendly
          const val = gray < 110 ? 255 : 0
          d[i] = d[i + 1] = d[i + 2] = val
          d[i + 3] = 255
        }

        ctx.putImageData(imageData, 0, 0)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          resolve(blob)
        }, 'image/png')
      }
      img.src = url
    })
  }

  async function runOCR(blob, psm) {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng', 1, { logger: () => {} })
    await worker.setParameters({
      // Only recognise letters and digits — ignores all FIFA/Panini noise
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
      tessedit_pageseg_mode: String(psm),
    })
    const { data: { text } } = await worker.recognize(blob)
    await worker.terminate()
    return text
  }

  function extractCodes(text) {
    const found = new Set()
    // Match 2–3 uppercase letters followed by optional space and 1–2 digits
    const matches = [...text.matchAll(/([A-Z]{2,3})\s*(\d{1,2})/g)]
    for (const m of matches) {
      const code = parseCode(`${m[1]}${m[2]}`)
      if (code) found.add(code)
    }
    return found
  }

  async function processImage(file) {
    setStatus('scanning')
    setError('')
    setProgress('Preprocessing image…')

    try {
      const preprocessed = await preprocessImage(file)

      // Pass 1: PSM 11 — sparse text, best for multiple stickers spread across image
      setProgress('Scanning (pass 1/2)…')
      const text1 = await runOCR(preprocessed, 11)

      // Pass 2: PSM 6 — uniform block, catches codes OCR missed in pass 1
      setProgress('Scanning (pass 2/2)…')
      const text2 = await runOCR(preprocessed, 6)

      // Also try original image with PSM 11 as a third pass
      setProgress('Finalising…')
      const text3 = await runOCR(file, 11)

      const allCodes = new Set([
        ...extractCodes(text1),
        ...extractCodes(text2),
        ...extractCodes(text3),
      ])

      if (allCodes.size === 0) {
        setError(
          'No sticker codes found. Tips: make sure the upper-right badge (e.g. "SWE 1") is in frame, use good lighting, and hold the camera steady.'
        )
        setStatus('error')
      } else {
        setResults([...allCodes].map(code => ({ code, current: getStickerStatus(code) })))
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
              The dark badge in the upper-right (e.g. <strong>SWE 1</strong>) will be detected automatically.
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 text-left space-y-1">
              <div>✅ Good lighting, flat surface</div>
              <div>✅ All badges clearly visible, not overlapping</div>
              <div>✅ Up to ~6 stickers per scan works well</div>
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
              // Restore capture attribute for next time
              setTimeout(() => input.setAttribute('capture', 'environment'), 500)
            }}
            className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold"
          >
            Choose from Gallery
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <div className="flex flex-col items-center pt-12 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand border-t-transparent animate-spin" />
          <div className="text-gray-500 text-sm text-center">{progress}</div>
          <div className="text-xs text-gray-400">Running 3 OCR passes for best results…</div>
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
            Found <strong>{results.length}</strong> sticker{results.length !== 1 ? 's' : ''}. Tap to set status.
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
