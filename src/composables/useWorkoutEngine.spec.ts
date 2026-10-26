import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import {
  AerobicOption,
  type SessionSnapshot,
  type WorkoutGenerationContext,
} from '@/core/EngineTypes'

const mocks = vi.hoisted(() => {
  const snapshot = {
    sessionToken: 'token-123',
    status: 'IDLE',
    currentIntervalIndex: 0,
    elapsedSecondsInCurrentInterval: 0,
    totalElapsedSeconds: 0,
    lastUpdatedTimestamp: 0,
    aerobicCompleted: undefined,
    loggedReps: [],
    intervals: [],
  }
  const callbacks: Array<(snapshot: unknown) => void> = []
  const instance = {
    getSessionSnapshot: vi.fn(() => snapshot),
    getStateSnapshot: vi.fn(() => snapshot),
    subscribe: vi.fn((callback: (snapshot: unknown) => void) => {
      callbacks.push(callback)
      callback(snapshot)
      return 'sub-token'
    }),
    unsubscribe: vi.fn(),
    initializeSession: vi.fn(),
    startWorkout: vi.fn(),
    pauseWorkout: vi.fn(),
    resumeWorkout: vi.fn(),
    confirmReps: vi.fn(),
    finishSession: vi.fn(),
    abandonCurrentSessionAsync: vi.fn().mockResolvedValue(undefined),
    reconstructSessionFromWAL: vi.fn(),
    getLifecycle: vi.fn(() => 'UNINITIALIZED'),
    dispose: vi.fn(),
  }
  return {
    snapshot,
    callbacks,
    instance,
    ctor: vi.fn(),
  }
})

vi.mock('@/core/WorkoutOrchestrator', () => ({
  WorkoutOrchestrator: mocks.ctor,
}))

function context(
  overrides: Partial<WorkoutGenerationContext> = {}
): WorkoutGenerationContext {
  return {
    sessionToken: 'token-123',
    profile: { age: 30 },
    chartNumber: 1,
    levelString: 'D-',
    aerobicSelection: AerobicOption.STATIONARY_RUN,
    isModernSafeMode: false,
    ...overrides,
  }
}

async function loadComposable() {
  vi.resetModules()
  return import('@/composables/useWorkoutEngine')
}

describe('useWorkoutEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.callbacks.length = 0
    mocks.ctor.mockImplementation(function () {
      return mocks.instance
    })
    mocks.instance.getSessionSnapshot.mockReturnValue(mocks.snapshot)
    mocks.instance.subscribe.mockImplementation(
      (callback: (snapshot: unknown) => void) => {
        mocks.callbacks.push(callback)
        callback(mocks.snapshot)
        return 'sub-token'
      }
    )
    mocks.instance.abandonCurrentSessionAsync.mockResolvedValue(undefined)
    mocks.instance.getLifecycle.mockReturnValue('UNINITIALIZED')
  })

  it('uses one module-level orchestrator for every caller', async () => {
    const { useWorkoutEngine } = await loadComposable()

    const first = useWorkoutEngine()
    const second = useWorkoutEngine()

    expect(mocks.ctor).toHaveBeenCalledTimes(1)
    first.startWorkout()
    expect(mocks.instance.startWorkout).toHaveBeenCalledTimes(1)
    second.pauseWorkout()
    expect(mocks.instance.pauseWorkout).toHaveBeenCalledTimes(1)
  })

  it('exposes a readonly snapshot', async () => {
    const { useWorkoutEngine } = await loadComposable()
    const api = useWorkoutEngine()

    expect(api.snapshot.value).toEqual(
      mocks.snapshot as unknown as SessionSnapshot
    )
    ;(api.snapshot as { value: unknown }).value = null

    expect(api.snapshot.value).toEqual(
      mocks.snapshot as unknown as SessionSnapshot
    )
  })

  it('subscribes on mount and unsubscribes on unmount', async () => {
    const { useWorkoutEngine } = await loadComposable()
    const api = useWorkoutEngine()

    expect(mocks.instance.subscribe).toHaveBeenCalledTimes(1)

    api.unmountEngine()
    expect(mocks.instance.unsubscribe).toHaveBeenCalledWith('sub-token')

    api.mountEngine()
    expect(mocks.instance.subscribe).toHaveBeenCalledTimes(2)
  })

  it('caches the context and delegates session actions', async () => {
    const { useWorkoutEngine } = await loadComposable()
    const api = useWorkoutEngine()
    const ctx = context()

    api.initializeSession(ctx)

    expect(mocks.instance.initializeSession).toHaveBeenCalledWith(ctx)
    api.startWorkout()
    api.pauseWorkout()
    api.resumeWorkout()
    api.confirmReps(8)
    api.finishSession(true)
    expect(mocks.instance.startWorkout).toHaveBeenCalledTimes(1)
    expect(mocks.instance.pauseWorkout).toHaveBeenCalledTimes(1)
    expect(mocks.instance.resumeWorkout).toHaveBeenCalledTimes(1)
    expect(mocks.instance.confirmReps).toHaveBeenCalledWith(8)
    expect(mocks.instance.finishSession).toHaveBeenCalledWith(true)
  })

  it('creates a new session token on restartWorkout', async () => {
    const { useWorkoutEngine } = await loadComposable()
    const api = useWorkoutEngine()
    api.initializeSession(context())
    const newToken = 'new-token'
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      newToken as `${string}-${string}-${string}-${string}-${string}`
    )

    api.restartWorkout()

    expect(mocks.instance.dispose).toHaveBeenCalledTimes(1)
    expect(mocks.instance.initializeSession).toHaveBeenLastCalledWith(
      expect.objectContaining({ sessionToken: newToken })
    )
    expect(mocks.instance.startWorkout).toHaveBeenCalledTimes(1)
  })

  it('does not expose elapsed state or re-render on elapsed-only broadcasts', async () => {
    const { useWorkoutEngine } = await loadComposable()
    const api = useWorkoutEngine()

    expect(api.elapsedSeconds).toBeUndefined()

    let renders = 0
    const Parent = defineComponent({
      setup() {
        const parentApi = useWorkoutEngine()
        return () => {
          renders += 1
          return h('div', parentApi.snapshot.value?.status ?? 'none')
        }
      },
    })
    const wrapper = mount(Parent)
    renders = 0

    const base = mocks.snapshot as unknown as SessionSnapshot
    for (let elapsed = 1; elapsed <= 60; elapsed++) {
      const tick = {
        ...base,
        elapsedSecondsInCurrentInterval: elapsed,
        totalElapsedSeconds: elapsed,
      }
      mocks.callbacks.forEach((callback) => callback(tick))
    }

    await nextTick()
    expect(renders).toBe(0)
    expect(api.snapshot.value?.status).toBe('IDLE')

    const running = { ...base, status: 'RUNNING' }
    mocks.callbacks.forEach((callback) => callback(running))

    await nextTick()
    expect(renders).toBe(1)
    expect(api.snapshot.value?.status).toBe('RUNNING')

    wrapper.unmount()
  })

  it('delegates abandon to the orchestrator', async () => {
    const { useWorkoutEngine } = await loadComposable()
    const api = useWorkoutEngine()

    await api.abandonCurrentSessionAsync()

    expect(mocks.instance.abandonCurrentSessionAsync).toHaveBeenCalledTimes(1)
  })
})
