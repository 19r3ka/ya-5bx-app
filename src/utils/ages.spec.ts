import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as ages from '@/utils/ages'
import { calculateAge } from '@/utils/ages'
import { getGoalLevelByAge } from '@/utils/levels'

describe('calculateAge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the year difference when the birthday has passed', () => {
    vi.setSystemTime(new Date(2026, 9, 21))
    expect(calculateAge(new Date(2000, 0, 15))).toBe(26)
  })

  it('subtracts one when the birthday has not occurred yet', () => {
    vi.setSystemTime(new Date(2026, 9, 21))
    expect(calculateAge(new Date(2000, 11, 31))).toBe(25)
  })

  it('counts the birthday when it is today', () => {
    vi.setSystemTime(new Date(2026, 9, 21))
    expect(calculateAge(new Date(2000, 9, 21))).toBe(26)
  })

  it('accepts an ISO date string', () => {
    vi.setSystemTime(new Date(2026, 9, 21))
    expect(calculateAge('2000-01-15')).toBe(26)
  })

  it('handles a February 29 birthday before and after the leap day', () => {
    vi.setSystemTime(new Date(2026, 1, 28))
    expect(calculateAge(new Date(2000, 1, 29))).toBe(25)
    vi.setSystemTime(new Date(2026, 2, 1))
    expect(calculateAge(new Date(2000, 1, 29))).toBe(26)
  })
})

// Replacement for the removed characterization blocks: the old chart-only
// mapping must be gone, and the ages it got wrong must resolve from the table.
describe('goal chart mapping', () => {
  it('no longer exposes a chart-only second source', () => {
    expect('getGoalChartByAge' in ages).toBe(false)
    expect('getAgeRangeLabel' in ages).toBe(false)
  })

  it('resolves the previously disputed ages from the single table', () => {
    expect(getGoalLevelByAge(18)).toBe('C5_C')
    expect(getGoalLevelByAge(25)).toBe('C4_A+')
  })
})
