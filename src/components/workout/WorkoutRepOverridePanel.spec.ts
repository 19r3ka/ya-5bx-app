import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import WorkoutRepOverridePanel from '@/components/workout/WorkoutRepOverridePanel.vue'

const vuetify = createVuetify()

function mountPanel(
  props: Record<string, unknown> = {}
): ReturnType<typeof mount> {
  return mount(WorkoutRepOverridePanel, {
    props: { defaultReps: 3, ...props },
    global: { plugins: [vuetify] },
  })
}

function repValue(wrapper: ReturnType<typeof mount>): string {
  return wrapper.find('.rep-number').text()
}

function buttonByLabel(
  wrapper: ReturnType<typeof mount>,
  label: string
): ReturnType<typeof wrapper.find> {
  return wrapper.find(`button[aria-label="${label}"]`)
}

describe('WorkoutRepOverridePanel', () => {
  it('seeds reps from defaultReps', () => {
    const wrapper = mountPanel({ defaultReps: 7 })

    expect(repValue(wrapper)).toBe('7')
  })

  it('increments and decrements without going below 0', async () => {
    const wrapper = mountPanel({ defaultReps: 1 })

    await buttonByLabel(wrapper, 'Increase reps').trigger('click')
    expect(repValue(wrapper)).toBe('2')

    await buttonByLabel(wrapper, 'Decrease reps').trigger('click')
    expect(repValue(wrapper)).toBe('1')

    await buttonByLabel(wrapper, 'Decrease reps').trigger('click')
    expect(repValue(wrapper)).toBe('0')

    await buttonByLabel(wrapper, 'Decrease reps').trigger('click')
    expect(repValue(wrapper)).toBe('0')
  })

  it('moves through the action label states', async () => {
    const wrapper = mountPanel({ defaultReps: 3 })
    const cta = () => wrapper.findAll('button').at(-1)

    expect(cta()?.text()).toContain('Log 3 reps')

    await cta()?.trigger('click')
    expect(cta()?.text()).toContain('Logged: 3 reps')

    await buttonByLabel(wrapper, 'Increase reps').trigger('click')
    expect(cta()?.text()).toContain('Update to 4 reps')
  })

  it('emits logged with the current reps', async () => {
    const wrapper = mountPanel({ defaultReps: 4 })

    await buttonByLabel(wrapper, 'Increase reps').trigger('click')
    await wrapper.findAll('button').at(-1)?.trigger('click')

    expect(wrapper.emitted('logged')).toEqual([[5]])
  })

  it('gates the stepper and the call to action when disabled', async () => {
    const wrapper = mountPanel({ defaultReps: 3, disabled: true })

    expect(
      buttonByLabel(wrapper, 'Increase reps').attributes('disabled')
    ).toBeDefined()
    expect(
      buttonByLabel(wrapper, 'Decrease reps').attributes('disabled')
    ).toBeDefined()

    await wrapper.findAll('button').at(-1)?.trigger('click')

    expect(wrapper.emitted('logged')).toBeUndefined()
    expect(wrapper.text()).toContain(
      "Logging unlocks when this set's timer ends."
    )
  })
})
