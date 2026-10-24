// CHARACTERIZATION: known gap, see SPEC AC-4.1. The legacy timer derives
// elapsed time by incrementing once per setInterval callback, not from a
// monotonic clock. Findings from T-008: it only feeds the display and the
// legacy localStorage record; the stored session duration comes from
// TimerEngine via WorkoutOrchestrator.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { LOCAL_STORAGE_TIMER_KEY } from '@/constants'

type TimerModule = typeof import('@/composables/useTimer')

interface TimerApi {
  isRunning: boolean
  timer: {
    index: number
    elapsedSeconds: number
    remainingSeconds: number
    durationSeconds: number
  }
  workout: {
    currentTimerIndex: number
    remainingWorkoutTimeSeconds: number
  }
  allTimersCompleted: boolean
  startTimer: () => void
  stopTimer: () => void
  resetWorkout: () => void
  goToNextTimer: () => void
  goToPreviousTimer: () => void
  goToTimer: (timerId: number) => void
}

function mountTimer(
  useTimer: TimerModule['useTimer']
): VueWrapper<Record<string, unknown>> {
  const component = defineComponent({
    setup() {
      return useTimer()
    },
    render: () => h('div'),
  })
  return mount(component) as VueWrapper<Record<string, unknown>>
}

async function loadTimerModule(): Promise<TimerModule> {
  vi.resetModules()
  return import('@/composables/useTimer')
}

describe('formatDisplayTime', () => {
  it('formats seconds as m:ss', async () => {
    const { formatDisplayTime } = await loadTimerModule()

    expect(formatDisplayTime(0)).toBe('0:00')
    expect(formatDisplayTime(5)).toBe('0:05')
    expect(formatDisplayTime(59)).toBe('0:59')
    expect(formatDisplayTime(60)).toBe('1:00')
    expect(formatDisplayTime(125)).toBe('2:05')
    expect(formatDisplayTime(3600)).toBe('60:00')
  })
})

describe('useTimer', () => {
  let wrapper: VueWrapper<Record<string, unknown>> | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
  })

  it('increments on every interval tick and stops', async () => {
    const { useTimer } = await loadTimerModule()
    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    api.goToTimer(0)
    api.startTimer()
    vi.advanceTimersByTime(3000)

    expect(api.timer.elapsedSeconds).toBe(3)
    expect(api.timer.remainingSeconds).toBe(117)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(657)

    api.stopTimer()
    vi.advanceTimersByTime(2000)

    expect(api.timer.elapsedSeconds).toBe(3)
    expect(api.isRunning).toBe(false)
  })

  it('resets the workout to the first timer and full remaining time', async () => {
    const { useTimer } = await loadTimerModule()
    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    api.goToTimer(2)
    api.startTimer()
    vi.advanceTimersByTime(2000)
    api.resetWorkout()

    expect(api.isRunning).toBe(false)
    expect(api.workout.currentTimerIndex).toBe(0)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(660)
    expect(api.timer.elapsedSeconds).toBe(0)
    expect(api.timer.durationSeconds).toBe(120)
    expect(api.timer.remainingSeconds).toBe(120)
    expect(api.allTimersCompleted).toBe(false)
  })

  it('clamps navigation at both ends', async () => {
    const { useTimer } = await loadTimerModule()
    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    api.goToPreviousTimer()
    expect(api.workout.currentTimerIndex).toBe(0)

    api.goToTimer(-1)
    expect(api.workout.currentTimerIndex).toBe(0)

    api.goToTimer(5)
    expect(api.workout.currentTimerIndex).toBe(0)

    api.goToTimer(4)
    expect(api.workout.currentTimerIndex).toBe(4)
    expect(api.timer.durationSeconds).toBe(360)

    api.goToNextTimer()
    expect(api.workout.currentTimerIndex).toBe(4)
    expect(api.allTimersCompleted).toBe(true)
    expect(api.isRunning).toBe(false)
  })

  it('moves forward and recomputes remaining workout time', async () => {
    const { useTimer } = await loadTimerModule()
    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    api.goToTimer(0)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(660)

    api.goToNextTimer()
    expect(api.workout.currentTimerIndex).toBe(1)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(540)
    api.stopTimer()

    api.goToPreviousTimer()
    expect(api.workout.currentTimerIndex).toBe(0)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(660)
  })

  it('loads a saved timer state and does not auto-start when it was stopped', async () => {
    localStorage.setItem(
      LOCAL_STORAGE_TIMER_KEY,
      JSON.stringify({
        timerRunning: false,
        timer: {
          index: 3,
          elapsedSeconds: 5,
          remainingSeconds: 55,
          durationSeconds: 60,
        },
        workoutIndex: 3,
      })
    )
    const { useTimer } = await loadTimerModule()

    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    expect(api.timer.index).toBe(3)
    expect(api.timer.elapsedSeconds).toBe(5)
    expect(api.workout.currentTimerIndex).toBe(3)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(420)
    expect(api.isRunning).toBe(false)
  })

  it('restarts a previously running timer and deducts its elapsed time', async () => {
    localStorage.setItem(
      LOCAL_STORAGE_TIMER_KEY,
      JSON.stringify({
        timerRunning: true,
        timer: {
          index: 3,
          elapsedSeconds: 5,
          remainingSeconds: 55,
          durationSeconds: 60,
        },
        workoutIndex: 3,
      })
    )
    const { useTimer } = await loadTimerModule()

    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    expect(api.isRunning).toBe(true)
    expect(api.workout.remainingWorkoutTimeSeconds).toBe(415)
    api.stopTimer()
  })

  it('saves the timer state on beforeunload', async () => {
    const { useTimer } = await loadTimerModule()
    wrapper = mountTimer(useTimer)
    const api = wrapper.vm as unknown as TimerApi

    api.goToTimer(2)
    api.startTimer()
    vi.advanceTimersByTime(1000)
    window.dispatchEvent(new Event('beforeunload'))

    const saved = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_TIMER_KEY) ?? '{}'
    )
    expect(saved.timerRunning).toBe(true)
    expect(saved.workoutIndex).toBe(2)
    expect(saved.timer.index).toBe(2)
    expect(saved.timer.elapsedSeconds).toBe(1)
  })
})
