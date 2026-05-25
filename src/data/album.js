// Full FIFA World Cup 2026 Panini album structure
// Sticker status: 0 = missing, 1 = have, 2 = have duplicate (available for swap)

export const SECTIONS = [
  {
    id: 'FWC',
    name: 'FWC Specials',
    emoji: '🏆',
    subsections: [
      { label: 'FWC – Specials 🏆', stickers: ['00', '1', '2', '3', '4'] },
      { label: 'FWC – Ball & Countries 🌎', stickers: ['5', '6', '7', '8'] },
      { label: 'FWC – History 📜', stickers: ['9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'] },
    ]
  },
  { id: 'MEX', name: 'Mexico', emoji: '🇲🇽', stickers: range(1, 20) },
  { id: 'RSA', name: 'South Africa', emoji: '🇿🇦', stickers: range(1, 20) },
  { id: 'KOR', name: 'South Korea', emoji: '🇰🇷', stickers: range(1, 20) },
  { id: 'CZE', name: 'Czechia', emoji: '🇨🇿', stickers: range(1, 20) },
  { id: 'CAN', name: 'Canada', emoji: '🇨🇦', stickers: range(1, 20) },
  { id: 'BIH', name: 'Bosnia & Herzegovina', emoji: '🇧🇦', stickers: range(1, 20) },
  { id: 'QAT', name: 'Qatar', emoji: '🇶🇦', stickers: range(1, 20) },
  { id: 'SUI', name: 'Switzerland', emoji: '🇨🇭', stickers: range(1, 20) },
  { id: 'BRA', name: 'Brazil', emoji: '🇧🇷', stickers: range(1, 20) },
  { id: 'MAR', name: 'Morocco', emoji: '🇲🇦', stickers: range(1, 20) },
  { id: 'HAI', name: 'Haiti', emoji: '🇭🇹', stickers: range(1, 20) },
  { id: 'SCO', name: 'Scotland', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', stickers: range(1, 20) },
  { id: 'USA', name: 'United States', emoji: '🇺🇸', stickers: range(1, 20) },
  { id: 'PAR', name: 'Paraguay', emoji: '🇵🇾', stickers: range(1, 20) },
  { id: 'AUS', name: 'Australia', emoji: '🇦🇺', stickers: range(1, 20) },
  { id: 'TUR', name: 'Turkey', emoji: '🇹🇷', stickers: range(1, 20) },
  { id: 'GER', name: 'Germany', emoji: '🇩🇪', stickers: range(1, 20) },
  { id: 'CUW', name: 'Curaçao', emoji: '🇨🇼', stickers: range(1, 20) },
  { id: 'CIV', name: "Côte d'Ivoire", emoji: '🇨🇮', stickers: range(1, 20) },
  { id: 'ECU', name: 'Ecuador', emoji: '🇪🇨', stickers: range(1, 20) },
  { id: 'NED', name: 'Netherlands', emoji: '🇳🇱', stickers: range(1, 20) },
  { id: 'JPN', name: 'Japan', emoji: '🇯🇵', stickers: range(1, 20) },
  { id: 'SWE', name: 'Sweden', emoji: '🇸🇪', stickers: range(1, 20) },
  { id: 'TUN', name: 'Tunisia', emoji: '🇹🇳', stickers: range(1, 20) },
  { id: 'BEL', name: 'Belgium', emoji: '🇧🇪', stickers: range(1, 20) },
  { id: 'EGY', name: 'Egypt', emoji: '🇪🇬', stickers: range(1, 20) },
  { id: 'IRN', name: 'Iran', emoji: '🇮🇷', stickers: range(1, 20) },
  { id: 'NZL', name: 'New Zealand', emoji: '🇳🇿', stickers: range(1, 20) },
  { id: 'ESP', name: 'Spain', emoji: '🇪🇸', stickers: range(1, 20) },
  { id: 'CPV', name: 'Cape Verde', emoji: '🇨🇻', stickers: range(1, 20) },
  { id: 'KSA', name: 'Saudi Arabia', emoji: '🇸🇦', stickers: range(1, 20) },
  { id: 'URU', name: 'Uruguay', emoji: '🇺🇾', stickers: range(1, 20) },
  { id: 'FRA', name: 'France', emoji: '🇫🇷', stickers: range(1, 20) },
  { id: 'SEN', name: 'Senegal', emoji: '🇸🇳', stickers: range(1, 20) },
  { id: 'IRQ', name: 'Iraq', emoji: '🇮🇶', stickers: range(1, 20) },
  { id: 'NOR', name: 'Norway', emoji: '🇳🇴', stickers: range(1, 20) },
  { id: 'ARG', name: 'Argentina', emoji: '🇦🇷', stickers: range(1, 20) },
  { id: 'ALG', name: 'Algeria', emoji: '🇩🇿', stickers: range(1, 20) },
  { id: 'AUT', name: 'Austria', emoji: '🇦🇹', stickers: range(1, 20) },
  { id: 'JOR', name: 'Jordan', emoji: '🇯🇴', stickers: range(1, 20) },
  { id: 'POR', name: 'Portugal', emoji: '🇵🇹', stickers: range(1, 20) },
  { id: 'COD', name: 'DR Congo', emoji: '🇨🇩', stickers: range(1, 20) },
  { id: 'UZB', name: 'Uzbekistan', emoji: '🇺🇿', stickers: range(1, 20) },
  { id: 'COL', name: 'Colombia', emoji: '🇨🇴', stickers: range(1, 20) },
  { id: 'ENG', name: 'England', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stickers: range(1, 20) },
  { id: 'CRO', name: 'Croatia', emoji: '🇭🇷', stickers: range(1, 20) },
  { id: 'GHA', name: 'Ghana', emoji: '🇬🇭', stickers: range(1, 20) },
  { id: 'PAN', name: 'Panama', emoji: '🇵🇦', stickers: range(1, 20) },
]

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => String(start + i))
}

// Flat list of all sticker codes (e.g. "AUT18", "FWC00")
export const ALL_STICKER_CODES = SECTIONS.flatMap(section => {
  if (section.subsections) {
    return section.subsections.flatMap(sub => sub.stickers.map(n => `${section.id}${n}`))
  }
  return section.stickers.map(n => `${section.id}${n}`)
})

export const TOTAL_STICKERS = ALL_STICKER_CODES.length

// Parse OCR/manual text like "AUT 18" or "AUT18" → "AUT18"
export function parseCode(raw) {
  if (!raw) return null
  const cleaned = raw.toUpperCase().replace(/\s+/g, '').trim()
  // Try direct match
  if (ALL_STICKER_CODES.includes(cleaned)) return cleaned
  // Try with space removed variations
  const match = cleaned.match(/^([A-Z]{2,3})(\d{1,2})$/)
  if (!match) return null
  const candidate = `${match[1]}${match[2]}`
  return ALL_STICKER_CODES.includes(candidate) ? candidate : null
}

// Get section info for a sticker code
export function getSectionForCode(code) {
  for (const section of SECTIONS) {
    if (section.subsections) {
      for (const sub of section.subsections) {
        if (sub.stickers.some(n => `${section.id}${n}` === code)) {
          return { ...section, label: sub.label }
        }
      }
    } else if (section.stickers.some(n => `${section.id}${n}` === code)) {
      return section
    }
  }
  return null
}
