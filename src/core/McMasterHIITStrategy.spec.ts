// Not on the workout path; see ROADMAP T-01.
import { describe, expect, it } from 'vitest'
import { McMasterHIITStrategy } from '@/core/McMasterHIITStrategy'
import {
  AerobicOption,
  type WorkoutGenerationContext,
} from '@/core/EngineTypes'

function context(
  overrides: Partial<WorkoutGenerationContext> = {}
): WorkoutGenerationContext {
  return {
    sessionToken: 'test-token',
    profile: { age: 30 },
    chartNumber: 1,
    levelString: 'D-',
    aerobicSelection: AerobicOption.STATIONARY_RUN,
    isModernSafeMode: false,
    ...overrides,
  }
}

describe('McMasterHIITStrategy.generateWorkout', () => {
  const strategy = new McMasterHIITStrategy()

  it('creates nine intervals alternating active and recovery', () => {
    const intervals = strategy.generateWorkout(context())

    expect(intervals).toHaveLength(9)
    expect(intervals.map((interval) => interval.exerciseId)).toEqual([
      'mcmaster_active',
      'mcmaster_recovery',
      'mcmaster_active',
      'mcmaster_recovery',
      'mcmaster_active',
      'mcmaster_recovery',
      'mcmaster_active',
      'mcmaster_recovery',
      'mcmaster_active',
    ])
  })

  it('makes every interval 60 seconds for 540 seconds total', () => {
    const intervals = strategy.generateWorkout(context())

    expect(intervals.every((interval) => interval.durationSeconds === 60)).toBe(
      true
    )
    expect(
      intervals.reduce((total, interval) => total + interval.durationSeconds, 0)
    ).toBe(540)
  })
})
