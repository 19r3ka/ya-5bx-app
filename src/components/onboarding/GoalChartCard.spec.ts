import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import GoalChartCard from '@/components/onboarding/GoalChartCard.vue'

const vuetify = createVuetify()

function mountCard(
  props: Record<string, unknown> = {}
): ReturnType<typeof mount> {
  return mount(GoalChartCard, {
    props: { chartNumber: 4, ageRange: '40–44', ...props },
    global: { plugins: [vuetify] },
  })
}

describe('GoalChartCard', () => {
  it('renders the chart number and age range from props', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('age group 40–44')
    expect(wrapper.text()).toContain('Targeting Chart 4')
    expect(wrapper.text()).toContain('Chart 4 Target')
  })

  it('updates when the props change', async () => {
    const wrapper = mountCard()
    await wrapper.setProps({ chartNumber: 6, ageRange: '18–25' })

    expect(wrapper.text()).toContain('age group 18–25')
    expect(wrapper.text()).toContain('Targeting Chart 6')
  })
})
