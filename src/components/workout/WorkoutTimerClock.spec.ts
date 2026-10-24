import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import WorkoutTimerClock from '@/components/workout/WorkoutTimerClock.vue'

const vuetify = createVuetify()

function mountClock(props: Record<string, unknown>): ReturnType<typeof mount> {
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
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows duration minus elapsed as mm:ss, clamped at 0', async () => {
    const wrapper = mountClock({ durationSeconds: 60, elapsedSeconds: 25 })
    expect(wrapper.find('.fc-timer').text()).toBe('00:35')

    await wrapper.setProps({ elapsedSeconds: 65 })
    expect(wrapper.find('.fc-timer').text()).toBe('00:00')
  })

  it('computes the progress percentage', () => {
    const half = mountClock({ durationSeconds: 60, elapsedSeconds: 30 })
    expect(progress(half).props('modelValue')).toBe(50)

    const empty = mountClock({ durationSeconds: 0, elapsedSeconds: 0 })
    expect(progress(empty).props('modelValue')).toBe(0)
  })

  it('marks expiry when remaining reaches 0', async () => {
    const wrapper = mountClock({ durationSeconds: 60, elapsedSeconds: 30 })
    expect(wrapper.find('.timer-expired').exists()).toBe(false)

    await wrapper.setProps({ elapsedSeconds: 60 })

    expect(progress(wrapper).classes()).toContain('timer-expired')
  })

  it('emits expired when the supplied elapsed time reaches the duration', async () => {
    const wrapper = mountClock({ durationSeconds: 60, elapsedSeconds: 59 })

    await wrapper.setProps({ elapsedSeconds: 60 })

    expect(wrapper.emitted('expired')).toBeTruthy()
  })

  it('runs the internal ticker only when elapsedSeconds is undefined', async () => {
    const internal = mountClock({ durationSeconds: 3 })
    expect(internal.find('.fc-timer').text()).toBe('00:03')

    await vi.advanceTimersByTimeAsync(1000)
    expect(internal.find('.fc-timer').text()).toBe('00:02')

    const external = mountClock({ durationSeconds: 3, elapsedSeconds: 0 })
    await vi.advanceTimersByTimeAsync(2000)
    expect(external.find('.fc-timer').text()).toBe('00:03')
    expect(external.emitted('expired')).toBeUndefined()
  })

  it('emits expired from the internal ticker at 0', async () => {
    const wrapper = mountClock({ durationSeconds: 3 })

    await vi.advanceTimersByTimeAsync(3000)

    expect(wrapper.find('.fc-timer').text()).toBe('00:00')
    expect(wrapper.emitted('expired')).toBeTruthy()
  })
})
