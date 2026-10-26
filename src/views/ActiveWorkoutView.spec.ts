import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import i18n from '@/plugins/i18n'
import ActiveWorkoutView from '@/views/ActiveWorkoutView.vue'
import WorkoutTimerClock from '@/components/workout/WorkoutTimerClock.vue'
import type { SessionSnapshot, WorkoutInterval } from '@/core/EngineTypes'

const engine = vi.hoisted(() => ({
  snapshot: null as { value: SessionSnapshot | null } | null,
  push: vi.fn(),
  pauseWorkout: vi.fn(),
  resumeWorkout: vi.fn(),
  confirmReps: vi.fn(),
  finishSession: vi.fn(),
  restartWorkout: vi.fn(),
  abandonCurrentSessionAsync: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: engine.push }) }))
vi.mock('@/composables/useWorkoutEngine', async () => {
  const { ref } = await import('vue')
  const snapshot = ref<SessionSnapshot | null>(null)
  engine.snapshot = snapshot
  return {
    useWorkoutEngine: () => ({
      snapshot,
      pauseWorkout: engine.pauseWorkout,
      resumeWorkout: engine.resumeWorkout,
      confirmReps: engine.confirmReps,
      finishSession: engine.finishSession,
      restartWorkout: engine.restartWorkout,
      abandonCurrentSessionAsync: engine.abandonCurrentSessionAsync,
    }),
  }
})
vi.mock('@/stores/useProgressionStore', () => ({
  useProgressionStore: () => ({
    telemetryService: { stagePendingSessionAsync: vi.fn() },
    currentChart: 1,
    currentLevel: 'D-',
    reloadHistoryAsync: vi.fn(),
  }),
}))

Object.defineProperty(globalThis, 'visualViewport', {
  configurable: true,
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    scale: 1,
    offsetLeft: 0,
    offsetTop: 0,
    width: 1024,
    height: 768,
  },
})

const vuetify = createVuetify()

function interval(overrides: Partial<WorkoutInterval> = {}): WorkoutInterval {
  return {
    exerciseId: 'ex_1',
    durationSeconds: 60,
    displayName: 'Toe Touch',
    description: 'Perform Toe Touch repetitions: 4',
    translationKey: 'exercise.e1',
    targetReps: 4,
    requiresRepConfirmation: true,
    ...overrides,
  }
}

function snapshot(overrides: Partial<SessionSnapshot> = {}): SessionSnapshot {
  return {
    sessionToken: 'session-token',
    status: 'RUNNING',
    currentIntervalIndex: 0,
    elapsedSecondsInCurrentInterval: 25,
    totalElapsedSeconds: 25,
    lastUpdatedTimestamp: 0,
    aerobicCompleted: undefined,
    loggedReps: [],
    intervals: [
      interval(),
      interval({ exerciseId: 'ex_2', displayName: 'Sit Up' }),
    ],
    ...overrides,
  }
}

function mountView() {
  return mount(ActiveWorkoutView, {
    global: {
      plugins: [vuetify, i18n, createPinia()],
      stubs: {
        WorkoutRepOverridePanel: true,
        PostWorkoutDialog: true,
      },
    },
  })
}

describe('ActiveWorkoutView timer wiring', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    if (engine.snapshot) engine.snapshot.value = null
  })

  it('shows the paused remaining label from the captured snapshot', async () => {
    engine.snapshot!.value = snapshot({ status: 'PAUSED' })

    const wrapper = mountView()
    await nextTick()

    expect(document.body.textContent).toContain('0:35 remaining')

    const clock = wrapper.findComponent(WorkoutTimerClock)
    expect(clock.props('isPaused')).toBe(true)
    expect(clock.props('elapsedSeconds')).toBeUndefined()
    expect(clock.props('startTimestamp')).toEqual(expect.any(Number))

    wrapper.unmount()
  })

  it('freezes the clock during REST and runs it during an active interval', async () => {
    engine.snapshot!.value = snapshot({ status: 'REST' })
    const restWrapper = mountView()
    await nextTick()
    expect(restWrapper.findComponent(WorkoutTimerClock).props('isPaused')).toBe(
      true
    )
    restWrapper.unmount()

    engine.snapshot!.value = snapshot({ status: 'RUNNING' })
    const activeWrapper = mountView()
    await nextTick()
    expect(
      activeWrapper.findComponent(WorkoutTimerClock).props('isPaused')
    ).toBe(false)
    activeWrapper.unmount()
  })
})
