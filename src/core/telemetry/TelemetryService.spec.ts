import { afterEach, describe, expect, it, vi } from 'vitest'
import { TelemetryService } from '@/core/telemetry/TelemetryService'
import { IndexedDBAdapter } from '@/core/storage/IndexedDBAdapter'
import type { CompletedSessionRecord } from '@/core/StorageTypes'

function record(
  overrides: Partial<CompletedSessionRecord> = {}
): CompletedSessionRecord {
  return {
    version: 1,
    sessionToken: 'session-1',
    completedAt: 100,
    chartNumber: 3,
    levelString: 'C3_B',
    durationSeconds: 660,
    telemetryStatus: 'PENDING_TELEMETRY',
    aerobicCompleted: true,
    ...overrides,
  }
}

function fakeAdapter() {
  return {
    commitCompletedWorkoutAsync: vi.fn().mockResolvedValue(undefined),
    getSessionByTokenAsync: vi.fn(),
  }
}

function serviceWith(
  adapter: ReturnType<typeof fakeAdapter>
): TelemetryService {
  return new TelemetryService(adapter as unknown as IndexedDBAdapter)
}

describe('TelemetryService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('stages a session as PENDING_TELEMETRY', async () => {
    const adapter = fakeAdapter()
    const service = serviceWith(adapter)
    const pending = record()

    const result = await service.stagePendingSessionAsync(pending)

    expect(result).toEqual({ ...pending, telemetryStatus: 'PENDING_TELEMETRY' })
    expect(adapter.commitCompletedWorkoutAsync).toHaveBeenCalledWith(result)
  })

  it('seals a confirmed session and records the stiffness flag', async () => {
    const adapter = fakeAdapter()
    const service = serviceWith(adapter)
    adapter.getSessionByTokenAsync.mockResolvedValue(record())

    const result = await service.sealSessionTelemetryAsync('session-1', true)

    expect(result).toMatchObject({
      sessionToken: 'session-1',
      userFlaggedStiffOrSore: true,
      telemetryStatus: 'SEALED_USER_CONFIRMED',
    })
    expect(adapter.commitCompletedWorkoutAsync).toHaveBeenCalledWith(result)
  })

  it('seals conservatively when requested', async () => {
    const adapter = fakeAdapter()
    const service = serviceWith(adapter)
    adapter.getSessionByTokenAsync.mockResolvedValue(record())

    const result = await service.sealSessionTelemetryAsync(
      'session-1',
      false,
      true
    )

    expect(result).toMatchObject({
      userFlaggedStiffOrSore: false,
      telemetryStatus: 'SEALED_CONSERVATIVE',
    })
  })

  it('returns null when sealing an unknown session', async () => {
    const adapter = fakeAdapter()
    const service = serviceWith(adapter)
    adapter.getSessionByTokenAsync.mockResolvedValue(null)

    await expect(
      service.sealSessionTelemetryAsync('missing', false)
    ).resolves.toBeNull()
    expect(adapter.commitCompletedWorkoutAsync).not.toHaveBeenCalled()
  })

  it('makes no network call when staging or sealing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const adapter = fakeAdapter()
    const service = serviceWith(adapter)
    adapter.getSessionByTokenAsync.mockResolvedValue(record())

    await service.stagePendingSessionAsync(record())
    await service.sealSessionTelemetryAsync('session-1', false)

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
