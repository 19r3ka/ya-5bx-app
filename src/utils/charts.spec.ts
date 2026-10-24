import { afterEach, describe, expect, it, vi } from 'vitest'
import { getChartExercises } from '@/utils/charts'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getChartExercises', () => {
  it('returns the exercise objects for a known chart', () => {
    const exercises = getChartExercises('C1')

    expect(exercises.map((exercise) => exercise.id)).toEqual([
      'E1',
      'E2',
      'E3',
      'E4',
      'E5',
      'E01',
      'E02',
    ])
    expect(exercises[0]).toMatchObject({
      id: 'E1',
      translationKey: 'exercise.e1',
      illustration: './illustrations/5bx_c1_e1.png',
      icon: './icons/5bx_c1_e1.svg',
    })
    expect(exercises[0].reps).toBeUndefined()
  })

  it('returns an empty array and logs an error for an unknown chart', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(getChartExercises('C9')).toEqual([])
    expect(error).toHaveBeenCalledWith('Chart with ID "C9" not found.')
  })

  // CHARACTERIZATION: missing exercise records yield a placeholder, and the
  // same missing ids are shared by charts C2-C6 in the data set.
  it('returns a placeholder and warns for a missing exercise id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const exercises = getChartExercises('C6')

    expect(exercises).toHaveLength(7)
    expect(exercises[0]).toEqual({
      id: 'E26',
      translationKey: '',
      illustration: '',
      icon: '',
    })
    expect(warn).toHaveBeenCalledWith(
      'Exercise with ID "E26" not found for chart "C6".'
    )
  })
})
