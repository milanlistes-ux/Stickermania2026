import { useEffect, useRef } from 'react'

export default function QRScanner({ onScan, onError }) {
  const containerRef = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    let html5QrCode

    async function start() {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      html5QrCode = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      )
      html5QrCode.render(
        (decodedText) => {
          onScan(decodedText)
          html5QrCode.clear().catch(() => {})
        },
        (err) => {
          // Silent scan errors (most are "no QR found in frame")
        }
      )
      scannerRef.current = html5QrCode
    }

    start().catch(e => onError?.(String(e)))

    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [])

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center">
      <div id="qr-reader" className="w-full" ref={containerRef} />
      <p className="text-white text-sm mt-4 px-6 text-center opacity-70">
        Point camera at your friend's QR code
      </p>
    </div>
  )
}
