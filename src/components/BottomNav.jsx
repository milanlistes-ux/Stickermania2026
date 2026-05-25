const TABS = [
  { id: 'album',    label: 'Album',    icon: '📖' },
  { id: 'stats',    label: 'Stats',    icon: '📊' },
  { id: 'trade',    label: 'Trade',    icon: '🔄' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="flex bg-white border-t border-gray-200 safe-area-bottom">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors
            ${active === t.id ? 'text-brand' : 'text-gray-400'}`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span className="text-xs font-medium">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
