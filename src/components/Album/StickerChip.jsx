import { useState, useRef } from 'react'
import { cycleStatus, decrementStatus } from '../../lib/userStore'

const STATUS_STYLES = {
  0: 'bg-yellow-100 text-yellow-700 border-yellow-200',           // missing
  1: 'bg-blue-200 text-blue-800 border-blue-300 font-bold',       // have
  2: 'bg-green-200 text-green-800 border-green-300 font-bold',    // swap
}

const STATUS_RING = {
  0: '',
  1: '',
  2: 'ring-2 ring-green-400',
}

export default function StickerChip({ code, number, status, onChange }) {
  const [localStatus, setLocalStatus] = useState(status)
  const longPressTimer = useRef(null)
  const didLongPress = useRef(false)

  function handlePointerDown() {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      const next = decrementStatus(code)
      setLocalStatus(next)
      onChange?.(code, next)
    }, 600)
  }

  function handlePointerUp() {
    clearTimeout(longPressTimer.current)
  }

  function handleClick() {
    if (didLongPress.current) return
    const next = cycleStatus(code)
    setLocalStatus(next)
    onChange?.(code, next)
  }

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className={`
        select-none w-12 h-12 rounded-full border-2 flex items-center justify-center
        text-sm font-semibold transition-all active:scale-90
        ${STATUS_STYLES[localStatus]} ${STATUS_RING[localStatus]}
      `}
      title={['Missing', 'Have', 'Swap available'][localStatus]}
    >
      {number}
    </button>
  )
}
