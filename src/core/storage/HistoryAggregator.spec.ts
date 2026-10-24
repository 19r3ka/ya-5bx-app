import { describe, expect, it } from 'vitest'
import { HistoryAggregator } from '@/core/storage/HistoryAggregator'
import type {
  CompletedSessionRecord,
  TelemetryStatus,
} from '@/core/StorageTypes'

function record(
  overrides: Partial<CompletedSessionRecord> = {}
): CompletedSessionRecord {
  return {
    version: 1,
    sessionToken: crypto.randomUUID(),
    completedAt: 0,
    chartNumber: 3,
    levelString: 'C3_B',
    durationSeconds: 660,
    telemetryStatus: 'SEALED_USER_CONFIRMED',
    aerobicCompleted: true,
    ...overrides,
  }
}

function count(history: CompletedSessionRecord[]): number {
  return HistoryAggregator.calculateContiguousVolume(history, 3, 'C3_B')
}

describe('HistoryAggregator.calculateContiguousVolume', () => {
  it('returns 0 for an empty history', () => {
    expect(count([])).toBe(0)
  })

  it('counts matching sessions newest-first until a mismatch', () => {
    const history = [
      record(),
      record(),
      record(),
      record({ chartNumber: 2, levelString: 'C2_C' }),
      record(),
    ]

    expect(count(history)).toBe(1)
  })

  it('counts a fully matching history', () => {
    expect(count([record(), record(), record()])).toBe(3)
  })

  it('returns 0 when the newest record is disjoint', () => {
    expect(count([record(), record(), record({ levelString: 'C3_C' })])).toBe(0)
    expect(count([record(), record({ chartNumber: 4 })])).toBe(0)
  })

  it('skips PENDING_TELEMETRY records without breaking the chain', () => {
    const history = [
      record(),
      record({ telemetryStatus: 'PENDING_TELEMETRY' }),
      record(),
      record({ telemetryStatus: 'PENDING_TELEMETRY' as TelemetryStatus }),
    ]

    expect(count(history)).toBe(2)
  })

  it('skips sessions with aerobicCompleted false without breaking the chain', () => {
    const history = [
      record(),
      record({ aerobicCompleted: false }),
      record(),
      record({ aerobicCompleted: false }),
    ]

    expect(count(history)).toBe(2)
  })

  it('does not count an aborted session on its own', () => {
    expect(count([record({ aerobicCompleted: false })])).toBe(0)
  })
})
