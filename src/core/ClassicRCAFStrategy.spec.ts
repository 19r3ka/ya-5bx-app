import { describe, expect, it } from 'vitest'
import { ClassicRCAFStrategy } from '@/core/ClassicRCAFStrategy'
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

describe('ClassicRCAFStrategy.generateWorkout', () => {
  const strategy = new ClassicRCAFStrategy()

  it('creates four rep intervals plus one aerobic interval', () => {
    const intervals = strategy.generateWorkout(context())

    expect(intervals).toHaveLength(5)
    expect(intervals.map((interval) => interval.exerciseId)).toEqual([
      'ex_1',
      'ex_2',
      'ex_3',
      'ex_4',
      'ex_5',
    ])
    expect(intervals.map((interval) => interval.durationSeconds)).toEqual([
      120, 60, 60, 60, 360,
    ])
    expect(
      intervals.slice(0, 4).map((interval) => interval.requiresRepConfirmation)
    ).toEqual([true, true, true, true])
    expect(intervals[4].targetReps).toBeUndefined()
  })

  it('uses the chart reps for the four rep intervals', () => {
    const intervals = strategy.generateWorkout(context())

    expect(
      intervals.slice(0, 4).map((interval) => interval.targetReps)
    ).toEqual([4, 5, 6, 3])
  })

  it('scales reps by the classic RCAF coefficient', () => {
    const intervals = strategy.generateWorkout(
      context({ chartNumber: 1, levelString: 'C', isModernSafeMode: false })
    )

    expect(intervals[1].displayName).toBe('Sit Up')
    expect(intervals[1].targetReps).toBe(9)
  })

  it('scales and rounds reps in modern safe mode', () => {
    const intervals = strategy.generateWorkout(
      context({ chartNumber: 1, levelString: 'C', isModernSafeMode: true })
    )

    expect(intervals[1].displayName).toBe('Abdominal Crunch')
    expect(intervals[1].targetReps).toBe(7)
  })

  it('uses a 360 second stationary run for STATIONARY_RUN', () => {
    const intervals = strategy.generateWorkout(
      context({ aerobicSelection: AerobicOption.STATIONARY_RUN })
    )

    expect(intervals[4]).toMatchObject({
      displayName: 'Stationary Run',
      durationSeconds: 360,
      description: 'Perform 150 stationary steps',
    })
  })

  it('derives the outdoor run duration from the chart minutes', () => {
    const intervals = strategy.generateWorkout(
      context({ aerobicSelection: AerobicOption.OUTDOOR_RUN_1_MILE })
    )

    expect(intervals[4]).toMatchObject({
      displayName: 'Outdoor Run (1 Mile)',
      durationSeconds: 840,
      description: 'Run 1 Mile in target: 14 minutes',
    })
  })

  it('derives the walk duration from the chart minutes', () => {
    const intervals = strategy.generateWorkout(
      context({ aerobicSelection: AerobicOption.WALK_2_MILES })
    )

    expect(intervals[4]).toMatchObject({
      displayName: 'Walk (2 Miles)',
      durationSeconds: 1680,
      description: 'Walk 2 Miles in target: 28 minutes',
    })
  })

  // CHARACTERIZATION: known gap, see SPEC AC-3.3.
  // The strategy throws instead of falling back to Chart 1, Level D-.
  it('throws for an unknown chart', () => {
    expect(() => strategy.generateWorkout(context({ chartNumber: 9 }))).toThrow(
      'Chart data not found for chart 9 level D-'
    )
  })

  // CHARACTERIZATION: known gap, see SPEC AC-3.3.
  it('throws for an unknown level', () => {
    expect(() =>
      strategy.generateWorkout(context({ levelString: 'Z' }))
    ).toThrow('Chart data not found for chart 1 level Z')
  })
})
