import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import WorkoutTimerClock from '@/components/workout/WorkoutTimerClock.vue'

const vuetify = createVuetify()

function mountClock(
  props: Record<string, unknown> = {}
): ReturnType<typeof mount> {
  return mount(WorkoutTimerClock, {
    props: { durationSeconds: 60, ...props },
    global: { plugins: [vuetify] },
  })
}

function progress(wrapper: ReturnType<typeof mount>) {
  return wrapper.findComponent({ name: 'VProgressLinear' })
}

describe('WorkoutTimerClock', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'Date',
        'performance',
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the duration initially and advances its own clock', async () => {
    const wrapper = mountClock({ durationSeconds: 60 })

    expect(wrapper.find('.fc-timer').text()).toBe('01:00')
    expect(progress(wrapper).props('modelValue')).toBe(0)
    expect(wrapper.emitted('started')).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(30_000)

    expect(wrapper.find('.fc-timer').text()).toBe('00:30')
    expect(progress(wrapper).props('modelValue')).toBe(50)
  })

  it('pauses once, freezes, and resumes from the frozen value', async () => {
    const wrapper = mountClock({ durationSeconds: 60 })

    await vi.advanceTimersByTimeAsync(10_000)
    expect(wrapper.find('.fc-timer').text()).toBe('00:50')

    await wrapper.setProps({ isPaused: true })
    expect(wrapper.emitted('paused')).toHaveLength(1)
    expect(progress(wrapper).classes()).toContain('timer-paused')

    await vi.advanceTimersByTimeAsync(5_000)
    expect(wrapper.find('.fc-timer').text()).toBe('00:50')

    await wrapper.setProps({ isPaused: false })
    await vi.advanceTimersByTimeAsync(5_000)

    expect(wrapper.find('.fc-timer').text()).toBe('00:45')
    expect(wrapper.emitted('paused')).toHaveLength(1)
  })

  it('resets and emits started when the duration changes', async () => {
    const wrapper = mountClock({ durationSeconds: 60 })

    await vi.advanceTimersByTimeAsync(10_000)
    expect(wrapper.find('.fc-timer').text()).toBe('00:50')

    await wrapper.setProps({ durationSeconds: 30 })

    expect(wrapper.find('.fc-timer').text()).toBe('00:30')
    expect(wrapper.emitted('started')).toHaveLength(2)
  })

  it('restores mid-interval elapsed from startTimestamp once', async () => {
    vi.setSystemTime(1_000_000)
    const now = Date.now()
    const wrapper = mountClock({
      durationSeconds: 60,
      startTimestamp: now - 10_000,
    })

    await nextTick()

    expect(Date.now()).toBe(now)
    expect(wrapper.props('startTimestamp')).toBe(now - 10_000)
    expect(wrapper.find('.fc-timer').text()).toBe('00:50')

    await vi.advanceTimersByTimeAsync(5_000)

    expect(wrapper.find('.fc-timer').text()).toBe('00:45')
  })

  it('emits expired exactly once when the clock reaches zero', async () => {
    const wrapper = mountClock({ durationSeconds: 3 })

    await vi.advanceTimersByTimeAsync(3_000)

    expect(wrapper.find('.fc-timer').text()).toBe('00:00')
    expect(wrapper.emitted('expired')).toHaveLength(1)
    expect(progress(wrapper).classes()).toContain('timer-expired')

    await vi.advanceTimersByTimeAsync(1_000)

    expect(wrapper.emitted('expired')).toHaveLength(1)
  })

  it('handles a zero-duration allocation without repeating expired', async () => {
    const wrapper = mountClock({ durationSeconds: 0 })

    expect(wrapper.find('.fc-timer').text()).toBe('00:00')
    expect(wrapper.emitted('expired')).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(1_000)

    expect(wrapper.emitted('expired')).toHaveLength(1)
  })

  it('applies timeScale to the display clock', async () => {
    const wrapper = mountClock({
      durationSeconds: 59,
      timeScale: 59 / 8,
    })

    await vi.advanceTimersByTimeAsync(8_000)

    expect(wrapper.find('.fc-timer').text()).toBe('00:00')
    expect(wrapper.emitted('expired')).toHaveLength(1)
  })
})
