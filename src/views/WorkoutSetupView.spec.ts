import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createVuetify } from 'vuetify'
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
