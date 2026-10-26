import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { CompletedSessionRecord } from '@/core/StorageTypes'

const mocks = vi.hoisted(() => ({
  adapter: {
    openAsync: vi.fn(),
    getAllSessionsAsync: vi.fn(),
  },
  telemetry: {
    stagePendingSessionAsync: vi.fn(),
    sealSessionTelemetryAsync: vi.fn(),
  },
  validate: vi.fn(),
}))

vi.mock('@/core/storage/IndexedDBAdapter', () => ({
  IndexedDBAdapter: vi.fn(function () {
    return mocks.adapter
  }),
}))

vi.mock('@/core/telemetry/TelemetryService', () => ({
  TelemetryService: vi.fn(function () {
    return mocks.telemetry
  }),
}))

vi.mock('@/core/ProgressionValidator', () => ({
  ProgressionValidator: vi.fn(function () {
    return { validate: mocks.validate }
  }),
}))

import { useProgressionStore } from '@/stores/useProgressionStore'
import { useUserStore } from '@/stores/useUserStore'

function record(
  overrides: Partial<CompletedSessionRecord> = {}
): CompletedSessionRecord {
  return {
    version: 1,
    sessionToken: crypto.randomUUID(),
    completedAt: 0,
    chartNumber: 4,
    levelString: 'B',
    durationSeconds: 660,
    telemetryStatus: 'SEALED_USER_CONFIRMED',
    aerobicCompleted: true,
    ...overrides,
  }
}

const eligible = {
  isEligible: true,
  reasonCode: 'ELIGIBLE' as const,
  requiredSessions: 4,
  remainingSessions: 0,
}

describe('useProgressionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.adapter.openAsync.mockResolvedValue(undefined)
    mocks.adapter.getAllSessionsAsync.mockResolvedValue([])
    mocks.validate.mockReturnValue(eligible)
  })

  it('has a null validation result before hydration', () => {
    const store = useProgressionStore()

    expect(store.isHydrated).toBe(false)
    expect(store.validationResult).toBeNull()
    expect(mocks.adapter.openAsync).not.toHaveBeenCalled()
  })

  it('derives chart and level from the profile currentLevel', async () => {
    const user = useUserStore()
    user.profile = {
      age: 40,
      currentLevel: 'C4_B',
      isOnboardingCompleted: true,
    }
    const store = useProgressionStore()

    await store.initAsync()

    expect(mocks.adapter.openAsync).toHaveBeenCalledTimes(1)
    expect(store.currentChart).toBe(4)
    expect(store.currentLevel).toBe('B')
    expect(store.isHydrated).toBe(true)
  })

  it('updates chart and level when the profile changes after hydration', async () => {
    const user = useUserStore()
    user.profile = {
      age: 40,
      currentLevel: 'C4_B',
      isOnboardingCompleted: true,
    }
    const store = useProgressionStore()

    await store.initAsync()

    user.profile = {
      age: 40,
      currentLevel: 'C2_C+',
      isOnboardingCompleted: true,
    }

    expect(store.currentChart).toBe(2)
    expect(store.currentLevel).toBe('C+')
  })

  it('falls back to chart 1, level D- when the profile is missing', async () => {
    const user = useUserStore()
    user.profile = null
    const store = useProgressionStore()

    await store.initAsync()

    expect(store.currentChart).toBe(1)
    expect(store.currentLevel).toBe('D-')
    expect(store.validationResult).toEqual(eligible)
    expect(mocks.validate).toHaveBeenCalledWith(
      { age: 30 },
      {
        currentChart: 1,
        currentLevel: 'D-',
        verifiedCompletedSessionsAtCurrentLevel: 0,
        userFlaggedStiffOrSore: false,
      }
    )
  })

  it('feeds contiguous volume and the last stiffness flag to the validator', async () => {
    const user = useUserStore()
    user.profile = {
      age: 40,
      currentLevel: 'C4_B',
      isOnboardingCompleted: true,
    }
    mocks.adapter.getAllSessionsAsync.mockResolvedValue([
      record({ chartNumber: 2, levelString: 'C', completedAt: 1 }),
      record({ completedAt: 2 }),
      record({ completedAt: 3 }),
      record({ completedAt: 4, userFlaggedStiffOrSore: true }),
    ])
    const store = useProgressionStore()

    await store.initAsync()

    expect(store.validationResult).toEqual(eligible)
    expect(mocks.validate).toHaveBeenCalledWith(
      { age: 40 },
      {
        currentChart: 4,
        currentLevel: 'B',
        verifiedCompletedSessionsAtCurrentLevel: 3,
        userFlaggedStiffOrSore: true,
      }
    )
  })

  it('reloads history without re-initializing', async () => {
    const user = useUserStore()
    user.profile = {
      age: 40,
      currentLevel: 'C4_B',
      isOnboardingCompleted: true,
    }
    const store = useProgressionStore()
    await store.initAsync()

    const refreshed = [record({ sessionToken: 'reloaded' })]
    mocks.adapter.getAllSessionsAsync.mockResolvedValue(refreshed)

    await store.reloadHistoryAsync()

    expect(store.rawHistory).toEqual(refreshed)
    expect(mocks.adapter.getAllSessionsAsync).toHaveBeenCalledTimes(2)
  })
})
