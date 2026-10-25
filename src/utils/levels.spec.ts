import { describe, expect, it, vi } from 'vitest'
import {
  extractChartAndLevel,
  getExercisesForLevel,
  getGoalLevelByAge,
} from '@/utils/levels'
import { getChartExercises } from '@/utils/charts'

describe('getGoalLevelByAge', () => {
  it('returns the goal level for an age inside the table', () => {
    expect(getGoalLevelByAge(18)).toBe('C5_C')
    expect(getGoalLevelByAge(25)).toBe('C4_A+')
    expect(getGoalLevelByAge(60)).toBe('C2_C+')
  })

  it('returns the oldest group level above the maximum age', () => {
    expect(getGoalLevelByAge(61)).toBe('C2_C+')
    expect(getGoalLevelByAge(120)).toBe('C2_C+')
  })

  it('returns null below the minimum age', () => {
    expect(getGoalLevelByAge(5)).toBeNull()
    expect(getGoalLevelByAge(0)).toBeNull()
  })

  it.each([
    [6, 'C1_B'],
    [7, 'C1_A'],
    [8, 'C2_D-'],
    [11, 'C2_A-'],
    [12, 'C3_D+'],
    [15, 'C4_D-'],
    [16, 'C4_C+'],
    [17, 'C4_C+'],
    [24, 'C5_C'],
    [25, 'C4_A+'],
    [29, 'C4_A+'],
    [30, 'C4_C-'],
    [34, 'C4_C-'],
    [35, 'C3_B'],
    [39, 'C3_B'],
    [40, 'C3_C'],
    [43, 'C3_C'],
    [44, 'C3_C'],
    [45, 'C2_A+'],
    [49, 'C2_A+'],
    [50, 'C2_C+'],
  ])('returns the pinned level for age %i', (age, expected) => {
    expect(getGoalLevelByAge(age)).toBe(expected)
  })
})

describe('extractChartAndLevel', () => {
  it('splits a level id on the separator', () => {
    expect(extractChartAndLevel('C1_D-')).toEqual(['C1', 'D-'])
    expect(extractChartAndLevel('C6_A+')).toEqual(['C6', 'A+'])
  })

  it('returns a single empty string for empty input', () => {
    expect(extractChartAndLevel('')).toEqual([''])
  })
})

describe('getExercisesForLevel', () => {
  it('returns the chart exercises with the level reps assigned', () => {
    const exercises = getExercisesForLevel('C1_D-')
    expect(exercises.map((exercise) => exercise.id)).toEqual([
      'E1',
      'E2',
      'E3',
      'E4',
      'E5',
      'E01',
      'E02',
    ])
    expect(exercises.map((exercise) => exercise.reps)).toEqual([
      2, 3, 4, 2, 100, 480, 1260,
    ])
  })

  it('throws on an unknown level id', () => {
    expect(() => getExercisesForLevel('C1_Z')).toThrow(
      'Level with ID C1_Z not found.'
    )
  })

  it('throws on a level id whose chart does not exist', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => getExercisesForLevel('C9_D-')).toThrow(
      'Level with ID C9_D- not found.'
    )
    expect(error).toHaveBeenCalledWith('Chart with ID "C9" not found.')
    error.mockRestore()
  })

  // Observed behavior: getExercisesForLevel mutates the shared exercise
  // objects returned by getChartExercises instead of returning copies, so the
  // reps from a later call overwrite the earlier ones.
  it('mutates the shared exercise objects', () => {
    getExercisesForLevel('C1_D-')
    const shared = getChartExercises('C1')[0]
    expect(shared.id).toBe('E1')
    expect(shared.reps).toBe(2)

    getExercisesForLevel('C1_A+')

    expect(shared.reps).toBe(20)
  })
})
