import { describe, expect, it } from 'vitest'
import type { CompletedSessionRecord } from '@/core/StorageTypes'
import {
  FALLBACK_TARGET,
  isValidChartLevel,
  parseLevelId,
  resolveSessionTarget,
} from '@/utils/sessionTarget'

function record(
  overrides: Partial<CompletedSessionRecord> = {}
): CompletedSessionRecord {
  return {
    version: 1,
    sessionToken: `token-${Math.random()}`,
    completedAt: 1_700_000_000_000,
    chartNumber: 3,
    levelString: 'C',
    durationSeconds: 660,
    telemetryStatus: 'SEALED_USER_CONFIRMED',
    aerobicCompleted: true,
    ...overrides,
  }
}

describe('isValidChartLevel', () => {
  it('accepts a real dataset row', () => {
    expect(isValidChartLevel(1, 'D-')).toBe(true)
    expect(isValidChartLevel(6, 'A+')).toBe(true)
  })

  it('rejects unknown charts and levels', () => {
    expect(isValidChartLevel(9, 'D-')).toBe(false)
    expect(isValidChartLevel(1, 'Z')).toBe(false)
    expect(isValidChartLevel(0, 'A')).toBe(false)
  })
})

describe('parseLevelId', () => {
  it('parses chart and level parts', () => {
    expect(parseLevelId('C3_D+')).toEqual({ chartNumber: 3, levelString: 'D+' })
  })

  it('rejects malformed ids', () => {
    expect(parseLevelId(undefined)).toBeNull()
    expect(parseLevelId('')).toBeNull()
    expect(parseLevelId('C3')).toBeNull()
    expect(parseLevelId('3_D-')).toBeNull()
    expect(parseLevelId('Cx_D-')).toBeNull()
  })
})

describe('resolveSessionTarget', () => {
  it('uses the profile level when it exists in the dataset', () => {
    expect(resolveSessionTarget('C4_B+', [])).toEqual({
      chartNumber: 4,
      levelString: 'B+',
      source: 'profile',
    })
  })

  it('falls back to the newest valid completed session', () => {
    const history = [
      record({ chartNumber: 2, levelString: 'A-' }),
      record({ chartNumber: 5, levelString: 'C+' }),
    ]

    expect(resolveSessionTarget('broken', history)).toEqual({
      chartNumber: 5,
      levelString: 'C+',
      source: 'history',
    })
  })

  it('uses completedAt, not array order, to pick the newest session', () => {
    const history = [
      record({ chartNumber: 4, levelString: 'A', completedAt: 2_000 }),
      record({ chartNumber: 2, levelString: 'B-', completedAt: 1_000 }),
    ]

    expect(resolveSessionTarget(undefined, history)).toEqual({
      chartNumber: 4,
      levelString: 'A',
      source: 'history',
    })
  })

  it('skips invalid history records and keeps looking', () => {
    const history = [
      record({ chartNumber: 2, levelString: 'A-' }),
      record({ chartNumber: 9, levelString: 'Z' }),
    ]

    expect(resolveSessionTarget(undefined, history)).toEqual({
      chartNumber: 2,
      levelString: 'A-',
      source: 'history',
    })
  })

  it('falls back to Chart 1 / Level D- when nothing is valid', () => {
    expect(resolveSessionTarget('C9_Z', [record({ chartNumber: 8 })])).toEqual({
      ...FALLBACK_TARGET,
      source: 'default',
    })
    expect(resolveSessionTarget(undefined, [])).toEqual({
      ...FALLBACK_TARGET,
      source: 'default',
    })
  })

  it('rejects a profile level whose chart does not exist', () => {
    expect(resolveSessionTarget('C9_A+', [])).toEqual({
      ...FALLBACK_TARGET,
      source: 'default',
    })
  })
})
