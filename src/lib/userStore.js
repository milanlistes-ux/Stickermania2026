import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

const USER_ID_KEY = 'sm2026_user_id'
const USER_NAME_KEY = 'sm2026_display_name'
const STICKERS_KEY = 'sm2026_stickers'

// --- Identity ---

export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = uuidv4()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

export function getDisplayName() {
  return localStorage.getItem(USER_NAME_KEY) || ''
}

export function setDisplayName(name) {
  localStorage.setItem(USER_NAME_KEY, name.trim())
  if (supabase) syncUserToRemote()
}

async function syncUserToRemote() {
  const userId = getUserId()
  const name = getDisplayName()
  await supabase.from('users').upsert({ id: userId, display_name: name }, { onConflict: 'id' })
}

// --- Sticker state (0=missing, 1=have, 2=swap) ---
// Local cache is source of truth while online, synced to Supabase

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STICKERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveLocal(data) {
  localStorage.setItem(STICKERS_KEY, JSON.stringify(data))
}

export function getLocalStickers() {
  return loadLocal()
}

export function getStickerStatus(code) {
  return loadLocal()[code] ?? 0
}

export function setStickerStatus(code, status) {
  const data = loadLocal()
  if (status === 0) {
    delete data[code]
  } else {
    data[code] = status
  }
  saveLocal(data)
  if (supabase) {
    const userId = getUserId()
    if (status === 0) {
      supabase.from('stickers').delete().eq('user_id', userId).eq('code', code)
    } else {
      supabase.from('stickers').upsert({ user_id: userId, code, status }, { onConflict: 'user_id,code' })
    }
  }
}

// Cycle: 0 → 1 → 2 → 0
export function cycleStatus(code) {
  const current = getStickerStatus(code)
  const next = (current + 1) % 3
  setStickerStatus(code, next)
  return next
}

// Long-hold: step back one
export function decrementStatus(code) {
  const current = getStickerStatus(code)
  const prev = current === 0 ? 0 : current - 1
  setStickerStatus(code, prev)
  return prev
}

// --- Bulk import (CSV/Sync) ---

export function importStickers(codesWithStatus) {
  const data = loadLocal()
  for (const { code, status } of codesWithStatus) {
    if (status === 0) delete data[code]
    else data[code] = status
  }
  saveLocal(data)
  if (supabase) syncAllToRemote(data)
}

async function syncAllToRemote(data) {
  const userId = getUserId()
  const rows = Object.entries(data).map(([code, status]) => ({ user_id: userId, code, status }))
  if (rows.length > 0) {
    await supabase.from('stickers').upsert(rows, { onConflict: 'user_id,code' })
  }
}

// --- Fetch remote user's swap list (for trade comparison) ---

export async function fetchRemoteUser(userId) {
  if (!supabase) return null
  const [userRes, stickerRes] = await Promise.all([
    supabase.from('users').select('id, display_name').eq('id', userId).single(),
    supabase.from('stickers').select('code, status').eq('user_id', userId),
  ])
  if (userRes.error) return null
  const stickers = {}
  for (const row of stickerRes.data || []) stickers[row.code] = row.status
  return { id: userId, display_name: userRes.data?.display_name || 'Friend', stickers }
}

// Apply trade: mark received stickers as "have" (1), remove from swaps if given
export function applyTrade(given, received) {
  const data = loadLocal()
  for (const code of given) {
    if (data[code] === 2) delete data[code]  // remove from swaps
  }
  for (const code of received) {
    data[code] = 1  // mark as have
  }
  saveLocal(data)
  if (supabase) syncAllToRemote(data)
}

// Pull remote stickers into local (initial load / sync)
export async function pullFromRemote() {
  if (!supabase) return
  const userId = getUserId()
  const { data, error } = await supabase.from('stickers').select('code, status').eq('user_id', userId)
  if (error || !data) return
  const obj = {}
  for (const row of data) obj[row.code] = row.status
  // Merge: remote wins for conflicts
  const local = loadLocal()
  const merged = { ...local, ...obj }
  saveLocal(merged)
}

// Push local stickers to remote (initial setup / recovery)
export async function pushToRemote() {
  const data = loadLocal()
  await syncAllToRemote(data)
}
