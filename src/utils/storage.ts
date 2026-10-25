/**
 * Guarded local-storage helpers.
 *
 * Local storage can throw on write (quota exceeded, private browsing,
 * disabled storage), and JSON.stringify can throw on circular data.
 * Callers must never see those exceptions: they get `false` instead.
 */

function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

export function safeWriteJson(key: string, value: unknown): boolean {
  let serialized: string | undefined

  try {
    serialized = JSON.stringify(value)
  } catch {
    return false
  }

  if (serialized === undefined || !hasLocalStorage()) {
    return false
  }

  try {
    localStorage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

export function safeRemove(key: string): boolean {
  if (!hasLocalStorage()) {
    return false
  }

  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
