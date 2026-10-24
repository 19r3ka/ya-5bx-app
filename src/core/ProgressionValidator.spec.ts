import { describe, expect, it } from 'vitest'
import { ProgressionValidator } from '@/core/ProgressionValidator'
import type { LevelHistorySnapshot } from '@/core/EngineTypes'

function snapshot(
  verifiedCompletedSessionsAtCurrentLevel: number,
  userFlaggedStiffOrSore = false
): LevelHistorySnapshot {
  return {
    currentChart: 3,
    currentLevel: 'C3_B',
    verifiedCompletedSessionsAtCurrentLevel,
    userFlaggedStiffOrSore,
  }
}

describe('ProgressionValidator.validate', () => {
  const validator = new ProgressionValidator()

  it.each([
    [20, 1],
    [21, 2],
    [29, 2],
    [30, 4],
    [39, 4],
    [40, 7],
    [49, 7],
    [50, 8],
    [59, 8],
    [60, 10],
    [100, 10],
  ])(
    'requires the band threshold for age %s (%s sessions)',
    (age, required) => {
      const result = validator.validate({ age }, snapshot(0))

      expect(result.requiredSessions).toBe(required)
      expect(result.remainingSessions).toBe(required)
      expect(result.isEligible).toBe(false)
      expect(result.reasonCode).toBe('VOLUME_QUOTA_INCOMPLETE')
    }
  )

  it('is eligible when verified sessions equal the requirement', () => {
    const result = validator.validate({ age: 40 }, snapshot(7))

    expect(result).toEqual({
      isEligible: true,
      reasonCode: 'ELIGIBLE',
      requiredSessions: 7,
      remainingSessions: 0,
    })
  })

  it('is eligible when verified sessions exceed the requirement', () => {
    const result = validator.validate({ age: 40 }, snapshot(9))

    expect(result.isEligible).toBe(true)
    expect(result.reasonCode).toBe('ELIGIBLE')
    expect(result.remainingSessions).toBe(0)
  })

  it('reports VOLUME_QUOTA_INCOMPLETE below the requirement', () => {
    const result = validator.validate({ age: 21 }, snapshot(1))

    expect(result).toEqual({
      isEligible: false,
      reasonCode: 'VOLUME_QUOTA_INCOMPLETE',
      requiredSessions: 2,
      remainingSessions: 1,
    })
  })

  it('restricts and raises the threshold when stiff or sore', () => {
    const result = validator.validate({ age: 40 }, snapshot(7, true))

    expect(result).toEqual({
      isEligible: false,
      reasonCode: 'USER_TELEMETRY_RESTRICTION',
      requiredSessions: 8,
      remainingSessions: 1,
    })
  })

  it('stays restricted when sore even if volume is already met', () => {
    const result = validator.validate({ age: 40 }, snapshot(20, true))

    expect(result.isEligible).toBe(false)
    expect(result.reasonCode).toBe('USER_TELEMETRY_RESTRICTION')
    expect(result.remainingSessions).toBe(0)
  })

  it.each([-1, -100, Number.NaN])('rejects invalid age %s', (age) => {
    const result = validator.validate({ age }, snapshot(10))

    expect(result).toEqual({
      isEligible: false,
      reasonCode: 'INVALID_AGE',
      requiredSessions: 0,
      remainingSessions: 0,
    })
  })
})
