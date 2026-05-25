import { useState, useRef } from 'react'
import { parseCode, ALL_STICKER_CODES } from '../../data/album'
import { importStickers } from '../../lib/userStore'

const SAMPLE_CSV = `sticker_code,quantity
AUT18,1
BRA5,2
GER1,1
ARG10,3
ESP7,2`

export default function CSVImport({ onClose }) {
  const [step, setStep] = useState('intro') // intro | preview | done
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState([])
  const fileRef = useRef()

  function parseCSV(text) {
    const lines = text.trim().split('\n')
    const ok = []
    const bad = []
    // Skip header row if it starts with non-code text
    const start = lines[0].toLowerCase().startsWith('sticker') ? 1 : 0
    for (let i = start; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const [rawCode, rawQty] = line.split(',').map(s => s.trim())
      const code = parseCode(rawCode)
      const qty = parseInt(rawQty, 10) || 1
      if (!code) {
        bad.push(`Line ${i + 1}: "${rawCode}" not recognized`)
      } else {
        ok.push({ code, status: qty >= 2 ? 2 : 1 })
      }
    }
    return { ok, bad }
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const { ok, bad } = parseCSV(ev.target.result)
      setRows(ok)
      setErrors(bad)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  function handlePaste(text) {
    const { ok, bad } = parseCSV(text)
    setRows(ok)
    setErrors(bad)
    setStep('preview')
  }

  function applyImport() {
    importStickers(rows)
    setStep('done')
  }

  return (
    <div className="p-4">
      {step === 'intro' && (
        <div>
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="font-semibold text-blue-800 mb-2">CSV Format</div>
            <div className="text-sm text-blue-700 mb-3">
              Two columns: <strong>sticker_code</strong> and <strong>quantity</strong>.<br/>
              Quantity ≥ 2 = marked as swap available.
            </div>
            <pre className="bg-white rounded-lg p-3 text-xs text-gray-700 font-mono overflow-x-auto">{SAMPLE_CSV}</pre>
          </div>

          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 bg-brand text-white rounded-xl font-semibold mb-3"
          >
            Upload CSV File
          </button>

          <PasteBox onPaste={handlePaste} />
        </div>
      )}

      {step === 'preview' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-800">{rows.length} stickers to import</span>
            <button onClick={() => setStep('intro')} className="text-brand text-sm">← Back</button>
          </div>

          {errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
              <div className="text-sm font-semibold text-yellow-700 mb-1">{errors.length} unrecognized rows (skipped)</div>
              {errors.slice(0, 5).map((e, i) => <div key={i} className="text-xs text-yellow-600">{e}</div>)}
              {errors.length > 5 && <div className="text-xs text-yellow-500">…and {errors.length - 5} more</div>}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto space-y-1 mb-4">
            {rows.map(({ code, status }) => (
              <div key={code} className="flex items-center gap-2 text-sm py-1">
                <span className="font-mono font-bold text-gray-700 w-16">{code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${status === 2 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {status === 2 ? 'Swap' : 'Have'}
                </span>
              </div>
            ))}
          </div>

          <button onClick={applyImport} className="w-full py-3 bg-brand text-white rounded-xl font-semibold">
            Import {rows.length} Stickers
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center pt-8 gap-4">
          <div className="text-5xl">✅</div>
          <div className="font-bold text-gray-800 text-lg">Import complete!</div>
          <div className="text-gray-500 text-sm">{rows.length} stickers added to your collection.</div>
          <button onClick={onClose} className="w-full py-3 bg-brand text-white rounded-xl font-semibold">Done</button>
        </div>
      )}
    </div>
  )
}

function PasteBox({ onPaste }) {
  const [text, setText] = useState('')
  return (
    <div>
      <div className="text-sm text-gray-500 mb-2">Or paste CSV content:</div>
      <textarea
        className="w-full h-32 border border-gray-200 rounded-xl p-3 text-xs font-mono resize-none outline-none focus:border-brand"
        placeholder={SAMPLE_CSV}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        disabled={!text.trim()}
        onClick={() => onPaste(text)}
        className="w-full py-2 border border-brand text-brand rounded-xl text-sm font-semibold mt-2 disabled:opacity-40"
      >
        Parse Pasted CSV
      </button>
    </div>
  )
}
