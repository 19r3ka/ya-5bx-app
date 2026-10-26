import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import Step5Tutorial from '@/components/onboarding/Step5Tutorial.vue'
import WorkoutRepOverridePanel from '@/components/workout/WorkoutRepOverridePanel.vue'

const vuetify = createVuetify()

function mountTutorial() {
  return mount(Step5Tutorial, {
    global: {
      plugins: [vuetify],
      stubs: { WorkoutRepOverridePanel: true },
    },
  })
}

describe('Step5Tutorial', () => {
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

  it('keeps the compressed countdown and switches to the rep panel', async () => {
    const wrapper = mountTutorial()

    expect(wrapper.find('.fc-timer').text()).toBe('00:59')
    expect(wrapper.findComponent(WorkoutRepOverridePanel).exists()).toBe(false)

    await vi.advanceTimersByTimeAsync(8_000)
    await nextTick()

    expect(wrapper.find('.fc-timer').exists()).toBe(false)
    expect(wrapper.findComponent(WorkoutRepOverridePanel).exists()).toBe(true)
    expect(wrapper.text()).toContain('Tap')
  })

  it('shows the success state after the rep panel logs', async () => {
    const wrapper = mountTutorial()

    await vi.advanceTimersByTimeAsync(8_000)
    await nextTick()

    wrapper.findComponent(WorkoutRepOverridePanel).vm.$emit('logged')
    await nextTick()

    expect(wrapper.text()).toContain('Set logged successfully!')
    expect(wrapper.text()).toContain('Complete Tutorial')
  })
})
