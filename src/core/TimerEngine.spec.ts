// CHARACTERIZATION: known gap, see SPEC AC-4.4. TimerEngine has no
// visibility/focus handling; the workout keeps running when the document is
// hidden. That gap is locked here, not fixed.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TimerEngine } from '@/core/TimerEngine'
import type { TimerEngineDelegate, WorkoutInterval } from '@/core/EngineTypes'

function interval(durationSeconds: number): WorkoutInterval {
  return {
    exerciseId: `ex_${durationSeconds}`,
    durationSeconds,
    displayName: `${durationSeconds}s`,
    description: `${durationSeconds}s`,
  }
}

function delegate(): TimerEngineDelegate {
  return {
    onTick: vi.fn(),
    onIntervalTransition: vi.fn(),
    onRestRequired: vi.fn(),
    onWorkoutComplete: vi.fn(),
  }
}

describe('TimerEngine', () => {
  let now = 0
  let engine: TimerEngine | null = null

  beforeEach(() => {
    now = 0
    vi.useFakeTimers()
    vi.spyOn(performance, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    engine?.dispose()
    engine = null
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('derives elapsed time from the start anchor, not the tick count', () => {
    const delegateMock = delegate()
    engine = new TimerEngine([interval(60)], delegateMock)

    engine.start()
    now = 1500
    engine.tick()
    expect(delegateMock.onTick).toHaveBeenLastCalledWith(1, 1)

    now = 3500
    engine.tick()
    expect(delegateMock.onTick).toHaveBeenLastCalledWith(3, 3)
  })

  it('excludes paused time when resumed', () => {
    const delegateMock = delegate()
    engine = new TimerEngine([interval(60)], delegateMock)

    engine.start()
    now = 3000
    engine.tick()
    expect(delegateMock.onTick).toHaveBeenLastCalledWith(3, 3)

    engine.pause()
    now = 8000
    engine.tick()
    expect(delegateMock.onTick).toHaveBeenLastCalledWith(3, 3)

    engine.resume()
    now = 9000
    engine.tick()
    expect(delegateMock.onTick).toHaveBeenLastCalledWith(4, 4)
  })

  it('holds at a gated boundary until resumeFromRest', () => {
    const delegateMock = delegate()
    engine = new TimerEngine([interval(10), interval(10)], delegateMock)
    engine.setGatedIndices([0])

    engine.start()
    now = 10500
    engine.tick()

    expect(delegateMock.onRestRequired).toHaveBeenCalledWith(0)
    expect(delegateMock.onIntervalTransition).not.toHaveBeenCalled()
    expect(engine.isResting()).toBe(true)

    now = 30000
    engine.tick()
    expect(delegateMock.onTick).not.toHaveBeenCalled()

    engine.resumeFromRest()
    expect(delegateMock.onIntervalTransition).toHaveBeenCalledWith(1)

    now = 31000
    engine.tick()
    expect(delegateMock.onTick).toHaveBeenLastCalledWith(1, 11)
  })

  it('recalibrates the anchor in restoreState', () => {
    const delegateMock = delegate()
    engine = new TimerEngine([interval(60)], delegateMock)

    now = 1000
    engine.restoreState(30, 0, 'RUNNING')
    now = 3000
    engine.tick()

    expect(delegateMock.onTick).toHaveBeenLastCalledWith(32, 32)
  })

  it('restores a paused session without accumulating time', () => {
    const delegateMock = delegate()
    engine = new TimerEngine([interval(60)], delegateMock)

    now = 1000
    engine.restoreState(30, 0, 'PAUSED')
    now = 6000
    engine.tick()

    expect(delegateMock.onTick).not.toHaveBeenCalled()
  })
})
