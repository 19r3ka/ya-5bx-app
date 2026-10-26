/**
 * Guarded local-storage helpers.
 *
 * Local storage can throw on write (quota exceeded, private browsing,
 * disabled storage), and JSON.stringify can throw on circular data.
 * Callers must never see those exceptions: they get `false` instead.
 */

/**
 * Reading the storage global can itself throw (cookies disabled, blocked
 * context), so even the lookup is guarded.
 */
function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function safeWriteJson(key: string, value: unknown): boolean {
  let serialized: string | undefined

  try {
    serialized = JSON.stringify(value)
  } catch {
    return false
  }

  const storage = getStorage()

  if (serialized === undefined || storage === null) {
    return false
  }

  try {
    storage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

export function safeRemove(key: string): boolean {
  const storage = getStorage()

  if (storage === null) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}
