import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import Step2Age from '@/components/onboarding/Step2Age.vue'
import GoalChartCard from '@/components/onboarding/GoalChartCard.vue'

const vuetify = createVuetify()

function mountStep(): ReturnType<typeof mount> {
  return mount(Step2Age, { global: { plugins: [vuetify] } })
}

function continueButton(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll('button')
    .find((button) => button.text().includes('Continue to Step 3'))
}

describe('Step2Age', () => {
  it('accepts ages 10 and 99 as valid', async () => {
    const wrapper = mountStep()

    await wrapper.find('input').setValue('10')
    expect(continueButton(wrapper)?.attributes('disabled')).toBeUndefined()

    await wrapper.find('input').setValue('99')
    expect(continueButton(wrapper)?.attributes('disabled')).toBeUndefined()
  })

  it('disables Continue for values outside 10 to 99', async () => {
    const wrapper = mountStep()

    expect(continueButton(wrapper)?.attributes('disabled')).toBeDefined()

    await wrapper.find('input').setValue('9')
    expect(continueButton(wrapper)?.attributes('disabled')).toBeDefined()

    await wrapper.find('input').setValue('100')
    expect(continueButton(wrapper)?.attributes('disabled')).toBeDefined()
  })

  it('derives the goal chart card from the age', async () => {
    const wrapper = mountStep()

    await wrapper.find('input').setValue('10')

    const card = wrapper.findComponent(GoalChartCard)
    expect(card.exists()).toBe(true)
    expect(card.props()).toMatchObject({ chartNumber: 6, ageRange: '18–25' })

    await wrapper.find('input').setValue('30')
    expect(wrapper.findComponent(GoalChartCard).props()).toMatchObject({
      chartNumber: 4,
      ageRange: '30–34',
    })
  })

  it('emits next with the age', async () => {
    const wrapper = mountStep()
    await wrapper.find('input').setValue('30')

    await continueButton(wrapper)?.trigger('click')

    expect(wrapper.emitted('next')).toEqual([[30]])
  })
})
