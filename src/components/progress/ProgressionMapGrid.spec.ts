import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import ProgressionMapGrid from '@/components/progress/ProgressionMapGrid.vue'

const vuetify = createVuetify()

function mountGrid(
  props: Record<string, unknown> = {}
): ReturnType<typeof mount> {
  return mount(ProgressionMapGrid, {
    props: {
      currentLevelId: 'C3_B',
      goalLevelId: 'C5_A+',
      isHydrated: true,
      ...props,
    },
    global: { plugins: [vuetify] },
  })
}

function cell(wrapper: ReturnType<typeof mount>, title: string) {
  return wrapper
    .findAll('.progression-cell')
    .find((item) => item.attributes('title') === title)
}

describe('ProgressionMapGrid', () => {
  it('parses valid level ids into chart and grade coordinates', () => {
    const wrapper = mountGrid()

    expect(cell(wrapper, 'Chart 3 · B (current)')?.classes()).toContain(
      'cell-current'
    )
    expect(cell(wrapper, 'Chart 5 · A+ (goal)')?.classes()).toContain(
      'cell-goal'
    )
  })

  it('falls back to chart 1 grade D- for an empty level id', () => {
    const wrapper = mountGrid({ currentLevelId: '' })

    expect(cell(wrapper, 'Chart 1 · D- (current)')?.exists()).toBe(true)
  })

  it('falls back to grade D- for an unknown grade', () => {
    const wrapper = mountGrid({ currentLevelId: 'C4_Z' })

    expect(cell(wrapper, 'Chart 4 · D- (current)')?.exists()).toBe(true)
  })

  it('marks current, completed, goal, and locked cells', () => {
    const wrapper = mountGrid()

    expect(cell(wrapper, 'Chart 3 · B (current)')?.classes()).toContain(
      'cell-current'
    )
    expect(cell(wrapper, 'Chart 2 · A+ (completed)')?.classes()).toContain(
      'cell-completed'
    )
    expect(cell(wrapper, 'Chart 3 · C+ (completed)')?.classes()).toContain(
      'cell-completed'
    )
    expect(cell(wrapper, 'Chart 5 · A+ (goal)')?.classes()).toContain(
      'cell-goal'
    )
    expect(cell(wrapper, 'Chart 6 · D- (locked)')?.classes()).toContain(
      'cell-locked'
    )
  })

  it('treats explicit completedLevelIds as completed above the current level', () => {
    const wrapper = mountGrid({ completedLevelIds: ['C4_A+'] })

    expect(cell(wrapper, 'Chart 4 · A+ (completed)')?.classes()).toContain(
      'cell-completed'
    )
  })

  it('shows the skeleton when not hydrated', () => {
    const wrapper = mountGrid({ isHydrated: false })

    expect(wrapper.findComponent({ name: 'VSkeletonLoader' }).exists()).toBe(
      true
    )
    expect(wrapper.findAll('.progression-cell')).toHaveLength(0)
  })
})
