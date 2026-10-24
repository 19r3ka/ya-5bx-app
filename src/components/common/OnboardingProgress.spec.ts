import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingProgress from '@/components/common/OnboardingProgress.vue'

function mountProgress(currentStep: number): ReturnType<typeof mount> {
  return mount(OnboardingProgress, { props: { currentStep } })
}

describe('OnboardingProgress', () => {
  it('renders six pips', () => {
    const wrapper = mountProgress(3)

    expect(wrapper.findAll('.progress-pip')).toHaveLength(6)
  })

  it('marks the pips at or below the current step as active', () => {
    const wrapper = mountProgress(3)
    const pips = wrapper.findAll('.progress-pip')

    expect(pips.map((pip) => pip.classes('active'))).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ])
  })

  it('marks no pips active at step 0 and all at step 6', () => {
    const none = mountProgress(0)
    expect(none.findAll('.progress-pip.active')).toHaveLength(0)

    const all = mountProgress(6)
    expect(all.findAll('.progress-pip.active')).toHaveLength(6)
  })
})
