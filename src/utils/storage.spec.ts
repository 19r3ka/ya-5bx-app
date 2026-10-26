import { afterEach, describe, expect, it, vi } from 'vitest'
import { safeRemove, safeWriteJson } from '@/utils/storage'

type FakeStorage = {
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
  getItem: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

function stubStorage(overrides: Partial<FakeStorage> = {}): FakeStorage {
  const storage: FakeStorage = {
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getItem: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  }
  vi.stubGlobal('localStorage', storage)
  return storage
}

describe('safeWriteJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('serializes the value and reports success', () => {
    const storage = stubStorage()

    expect(safeWriteJson('test_key', { step: 2 })).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith('test_key', '{"step":2}')
  })

  it('returns false when the write exceeds the quota', () => {
    const storage = stubStorage({
      setItem: vi.fn(() => {
        throw new DOMException('quota', 'QuotaExceededError')
      }),
    })

    expect(safeWriteJson('test_key', { step: 2 })).toBe(false)
    expect(storage.setItem).toHaveBeenCalled()
  })

  it('returns false when storage access is denied', () => {
    stubStorage({
      setItem: vi.fn(() => {
        throw new DOMException('denied', 'SecurityError')
      }),
    })

    expect(() => safeWriteJson('test_key', 1)).not.toThrow()
    expect(safeWriteJson('test_key', 1)).toBe(false)
  })

  it('returns false when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(safeWriteJson('test_key', 1)).toBe(false)
  })

  it('returns false and skips the write when the value is not serializable', () => {
    const storage = stubStorage()
    const circular: Record<string, unknown> = {}
    circular.self = circular

    expect(safeWriteJson('test_key', circular)).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })
})

describe('safeRemove', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('removes the key and reports success', () => {
    const storage = stubStorage()

    expect(safeRemove('test_key')).toBe(true)
    expect(storage.removeItem).toHaveBeenCalledWith('test_key')
  })

  it('returns false when storage access is denied', () => {
    stubStorage({
      removeItem: vi.fn(() => {
        throw new DOMException('denied', 'SecurityError')
      }),
    })

    expect(safeRemove('test_key')).toBe(false)
  })

  it('returns false when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(safeRemove('test_key')).toBe(false)
  })
})

describe('guarded global access', () => {
  it('returns false when reading the storage global throws', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

    try {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('denied', 'SecurityError')
        },
      })

      expect(() => safeWriteJson('test_key', 1)).not.toThrow()
      expect(safeWriteJson('test_key', 1)).toBe(false)
      expect(safeRemove('test_key')).toBe(false)
    } finally {
      if (original) {
        Object.defineProperty(globalThis, 'localStorage', original)
      } else {
        Reflect.deleteProperty(globalThis, 'localStorage')
      }
    }
  })
})
