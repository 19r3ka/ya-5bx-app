import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createVuetify } from 'vuetify'
import chartsMatrixJson from '@/core/data/charts_matrix.json'
import { AerobicOption } from '@/core/EngineTypes'
import { ClassicRCAFStrategy } from '@/core/ClassicRCAFStrategy'
import i18n from '@/plugins/i18n'
import WorkoutSetupView from '@/views/WorkoutSetupView.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useProgressionStore } from '@/stores/useProgressionStore'

const { push, initializeSession, startWorkout } = vi.hoisted(() => ({
  push: vi.fn(),
  initializeSession: vi.fn(),
  startWorkout: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/composables/useWorkoutEngine', () => ({
  useWorkoutEngine: () => ({ initializeSession, startWorkout }),
}))
vi.mock('@/composables/useAudioFeedback', () => ({
  useAudioFeedback: () => ({ unlock: vi.fn() }),
}))

const vuetify = createVuetify()

function mountSetup(): {
  wrapper: ReturnType<typeof mount>
  userStore: ReturnType<typeof useUserStore>
  pinia: Pinia
} {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(WorkoutSetupView, {
    global: { plugins: [vuetify, i18n, pinia] },
  })

  return { wrapper, userStore: useUserStore(), pinia }
}

async function startWorkoutSession(
  wrapper: ReturnType<typeof mount>
): Promise<void> {
  await wrapper.find('.start-btn').trigger('click')
}

describe('WorkoutSetupView session target', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders every strategy interval from the chart', async () => {
    const { wrapper, userStore } = mountSetup()
    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C1_D-',
    }
    await nextTick()

    const text = wrapper.text()
    expect(text).toContain('Toe Touch')
    expect(text).toContain('Sit Up')
    expect(text).toContain('Leg Lift')
    expect(text).toContain('Push Up')
    expect(text).toContain('4 Reps')
    expect(text).toContain('5 Reps')
    expect(text).toContain('6 Reps')
    expect(text).toContain('3 Reps')
    expect(text).toContain('06:00')
    expect(text).not.toContain('3 Sets')
    expect(text).not.toContain('45 Total')
    expect(text).not.toContain('Stretching')
  })

  it('updates the preview when the profile level changes', async () => {
    const { wrapper, userStore } = mountSetup()
    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C1_D-',
    }
    await nextTick()

    expect(wrapper.text()).toContain('4 Reps')

    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C3_D+',
    }
    await nextTick()

    expect(wrapper.text()).toContain('10 Reps')
    expect(wrapper.text()).toContain('11 Reps')
    expect(wrapper.text()).toContain('12 Reps')
    expect(wrapper.text()).toContain('9 Reps')
  })

  it('renders chart-derived reps and durations for every chart/level pair', async () => {
    const { wrapper, userStore } = mountSetup()
    const strategy = new ClassicRCAFStrategy()
    const matrix = chartsMatrixJson as Record<string, Record<string, unknown>>

    const formatDuration = (totalSeconds: number): string => {
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    for (const [chart, levels] of Object.entries(matrix)) {
      for (const level of Object.keys(levels)) {
        userStore.profile = {
          isOnboardingCompleted: true,
          currentLevel: `C${chart}_${level}`,
        }
        await nextTick()

        const expected = strategy.generateWorkout({
          sessionToken: 'setup-test',
          profile: { age: 30 },
          chartNumber: Number(chart),
          levelString: level,
          aerobicSelection: AerobicOption.STATIONARY_RUN,
          isModernSafeMode: false,
        })
        const cards = wrapper.findAll('[data-testid="setup-interval"]')

        expect(cards).toHaveLength(expected.length)
        expect(
          cards.map((card) =>
            card.find('[data-testid="setup-interval-target"]').text()
          )
        ).toEqual(
          expected.map((interval) =>
            interval.targetReps === undefined
              ? 'Aerobic'
              : `${interval.targetReps} Reps`
          )
        )
        expect(
          cards.map((card) =>
            card.find('[data-testid="setup-interval-duration"]').text()
          )
        ).toEqual(
          expected.map((interval) => formatDuration(interval.durationSeconds))
        )
      }
    }
  })

  it('updates the preview when the aerobic option changes', async () => {
    const { wrapper, userStore } = mountSetup()
    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C1_D-',
    }
    await nextTick()

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(4)

    await radios[0].setValue()
    await nextTick()

    expect(wrapper.text()).toContain('Outdoor Run (1 Mile)')
    expect(wrapper.text()).toContain('14:00')
  })

  it('falls back to a valid target and names it when the profile level is invalid', async () => {
    const { wrapper, userStore } = mountSetup()
    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C9_Z',
    }

    await startWorkoutSession(wrapper)

    expect(initializeSession).toHaveBeenCalledWith(
      expect.objectContaining({ chartNumber: 1, levelString: 'D-' })
    )
    expect(wrapper.find('[role="status"]').text()).toContain(
      'Chart 1 · Level D-'
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(push).toHaveBeenCalledWith({ name: 'active-workout' })
  })

  it('shows no warning when the profile level is valid', async () => {
    const { wrapper, userStore } = mountSetup()
    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C3_D+',
    }

    await startWorkoutSession(wrapper)

    expect(initializeSession).toHaveBeenCalledWith(
      expect.objectContaining({ chartNumber: 3, levelString: 'D+' })
    )
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(push).toHaveBeenCalledWith({ name: 'active-workout' })
  })

  it('stays on setup with an error banner when generation throws', async () => {
    const { wrapper, userStore } = mountSetup()
    userStore.profile = {
      isOnboardingCompleted: true,
      currentLevel: 'C3_D+',
    }
    initializeSession.mockImplementationOnce(() => {
      throw new Error('bad chart data')
    })

    await startWorkoutSession(wrapper)

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it('uses the newest valid completed session when the profile level is missing', async () => {
    const { wrapper, userStore, pinia } = mountSetup()
    userStore.profile = { isOnboardingCompleted: true }
    const progressionStore = useProgressionStore(pinia)
    progressionStore.rawHistory = [
      {
        version: 1,
        sessionToken: 'a',
        completedAt: 1_000,
        chartNumber: 2,
        levelString: 'A-',
        durationSeconds: 660,
        telemetryStatus: 'SEALED_USER_CONFIRMED',
        aerobicCompleted: true,
      },
      {
        version: 1,
        sessionToken: 'b',
        completedAt: 2_000,
        chartNumber: 4,
        levelString: 'B',
        durationSeconds: 660,
        telemetryStatus: 'SEALED_USER_CONFIRMED',
        aerobicCompleted: true,
      },
    ]

    await startWorkoutSession(wrapper)

    expect(initializeSession).toHaveBeenCalledWith(
      expect.objectContaining({ chartNumber: 4, levelString: 'B' })
    )
    expect(wrapper.find('[role="status"]').text()).toContain(
      'Chart 4 · Level B'
    )
  })
})
