import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateAge, getAgeRangeLabel, getGoalChartByAge } from '@/utils/ages'

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

describe('getGoalChartByAge', () => {
  it.each([
    [5, 6],
    [25, 6],
    [26, 5],
    [29, 5],
    [30, 4],
    [34, 4],
    [35, 3],
    [44, 3],
    [45, 2],
    [54, 2],
    [55, 1],
    [80, 1],
  ])('returns chart %s -> %s', (age, chart) => {
    expect(getGoalChartByAge(age)).toBe(chart)
  })

  // CHARACTERIZATION: known gap, see SPEC R3
  // getGoalChartByAge disagrees with src/data/ageGroups.json: for age 25 this
  // function returns 6 while ageGroups maps 25-29 to C4_A+ (chart 4); for age
  // 18 it returns 6 while ageGroups maps 18-24 to C5_C (chart 5).
  it('disagrees with ageGroups.json at the 25 and 18 boundaries', () => {
    expect(getGoalChartByAge(25)).toBe(6)
    expect(getGoalChartByAge(18)).toBe(6)
  })
})

describe('getAgeRangeLabel', () => {
  it.each([
    [5, '18–25'],
    [25, '18–25'],
    [26, '26–29'],
    [29, '26–29'],
    [30, '30–34'],
    [34, '30–34'],
    [35, '35–39'],
    [39, '35–39'],
    [40, '40–44'],
    [44, '40–44'],
    [45, '45–49'],
    [49, '45–49'],
    [50, '50–54'],
    [54, '50–54'],
    [55, '55+'],
    [80, '55+'],
  ])('returns the label for age %s -> %s', (age, label) => {
    expect(getAgeRangeLabel(age)).toBe(label)
  })
})
