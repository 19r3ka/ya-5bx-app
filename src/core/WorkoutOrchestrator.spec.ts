import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WorkoutOrchestrator } from '@/core/WorkoutOrchestrator'
import {
  AerobicOption,
  OrchestratorLifecycle,
  type IPersistenceAdapter,
  type IWorkoutStrategy,
  type WorkoutGenerationContext,
} from '@/core/EngineTypes'

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

function gatedStrategy(): IWorkoutStrategy {
  return {
    generateWorkout: () => [
      {
        exerciseId: 'ex_1',
        durationSeconds: 10,
        displayName: 'First',
        description: 'First',
        targetReps: 5,
        requiresRepConfirmation: true,
      },
      {
        exerciseId: 'ex_2',
        durationSeconds: 10,
        displayName: 'Second',
        description: 'Second',
      },
    ],
  }
}

function mockAdapter(): IPersistenceAdapter & {
  saveSessionAsync: ReturnType<typeof vi.fn>
} {
  return {
    saveSessionAsync: vi.fn().mockResolvedValue(undefined),
  }
}

describe('WorkoutOrchestrator', () => {
  let now = 0
  let orchestrator: WorkoutOrchestrator | null = null

  beforeEach(() => {
    now = 0
    vi.useFakeTimers()
    vi.spyOn(performance, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    orchestrator?.dispose()
    orchestrator = null
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('moves through the lifecycle and completes the session', () => {
    orchestrator = new WorkoutOrchestrator()
    expect(orchestrator.getLifecycle()).toBe(
      OrchestratorLifecycle.UNINITIALIZED
    )

    orchestrator.initializeSession(context())
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.READY)
    expect(orchestrator.getSessionSnapshot().status).toBe('IDLE')

    orchestrator.startWorkout()
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.RUNNING)
    expect(orchestrator.getSessionSnapshot().status).toBe('RUNNING')

    orchestrator.pauseWorkout()
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.PAUSED)
    expect(orchestrator.getSessionSnapshot().status).toBe('PAUSED')

    orchestrator.resumeWorkout()
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.RUNNING)

    orchestrator.finishSession(true)
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.COMPLETED)
    expect(orchestrator.getSessionSnapshot().status).toBe('COMPLETED')
    expect(orchestrator.getSessionSnapshot().aerobicCompleted).toBe(true)
  })

  it('broadcasts RUNNING before releasing the REST gate on confirmReps', () => {
    orchestrator = new WorkoutOrchestrator(gatedStrategy())
    const statuses: string[] = []
    orchestrator.subscribe((snapshot) => statuses.push(snapshot.status))

    orchestrator.initializeSession(context())
    orchestrator.startWorkout()

    now = 10500
    vi.advanceTimersByTime(250)
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.REST)
    expect(statuses.at(-1)).toBe('REST')

    orchestrator.confirmReps(7)

    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.RUNNING)
    expect(statuses.at(-1)).toBe('RUNNING')
    expect(orchestrator.getSessionSnapshot().loggedReps).toEqual([7])
  })

  it('ignores confirmReps outside the REST phase', () => {
    orchestrator = new WorkoutOrchestrator()
    orchestrator.initializeSession(context())

    orchestrator.confirmReps(5)

    expect(orchestrator.getSessionSnapshot().loggedReps).toEqual([])
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.READY)
  })

  it('records aerobicCompleted false when the session ends early', () => {
    orchestrator = new WorkoutOrchestrator()
    orchestrator.initializeSession(context())
    orchestrator.startWorkout()

    orchestrator.finishSession(false)

    expect(orchestrator.getSessionSnapshot().aerobicCompleted).toBe(false)
    expect(orchestrator.getSessionSnapshot().status).toBe('COMPLETED')
  })

  it('abandons the session, saves the snapshot, and resets', async () => {
    const adapter = mockAdapter()
    orchestrator = new WorkoutOrchestrator(undefined, adapter)
    orchestrator.initializeSession(context())
    orchestrator.startWorkout()

    await orchestrator.abandonCurrentSessionAsync()

    expect(adapter.saveSessionAsync).toHaveBeenCalledTimes(1)
    const [token, snapshot] = adapter.saveSessionAsync.mock.calls[0]
    expect(token).toBe('token-123')
    expect(snapshot.sessionToken).toBe('token-123')
    expect(orchestrator.getLifecycle()).toBe(
      OrchestratorLifecycle.UNINITIALIZED
    )
  })

  it('throws when re-initializing during an active session', () => {
    orchestrator = new WorkoutOrchestrator()
    orchestrator.initializeSession(context())

    expect(() => orchestrator?.initializeSession(context())).toThrow(
      'Session is already active'
    )

    orchestrator.startWorkout()
    expect(() => orchestrator?.initializeSession(context())).toThrow(
      'Session is already active'
    )
  })

  it('subscribes, broadcasts with fault isolation, and unsubscribes', () => {
    orchestrator = new WorkoutOrchestrator()
    const good = vi.fn()
    const faulty = vi.fn(() => {
      throw new Error('Crashing subscriber!')
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const goodToken = orchestrator.subscribe(good)
    const faultyToken = orchestrator.subscribe(faulty)
    expect(orchestrator.getSubscriberCount()).toBe(2)

    orchestrator.initializeSession(context())
    orchestrator.startWorkout()

    expect(good).toHaveBeenCalled()
    expect(faulty).toHaveBeenCalled()
    expect(error).toHaveBeenCalled()

    orchestrator.unsubscribe(goodToken)
    orchestrator.unsubscribe(faultyToken)
    expect(orchestrator.getSubscriberCount()).toBe(0)
  })

  it('reconstructs a session from a matching WAL snapshot', () => {
    orchestrator = new WorkoutOrchestrator()
    const wal = {
      sessionToken: 'token-123',
      status: 'RUNNING' as const,
      currentIntervalIndex: 3,
      elapsedSecondsInCurrentInterval: 20,
      totalElapsedSeconds: 200,
      lastUpdatedTimestamp: Date.now() - 3600000,
    }

    orchestrator.reconstructSessionFromWAL(context(), wal)

    const snapshot = orchestrator.getSessionSnapshot()
    expect(snapshot.sessionToken).toBe('token-123')
    expect(snapshot.status).toBe('RUNNING')
    expect(snapshot.currentIntervalIndex).toBe(3)
    expect(snapshot.elapsedSecondsInCurrentInterval).toBe(20)
    expect(snapshot.totalElapsedSeconds).toBe(200)
    expect(orchestrator.getLifecycle()).toBe(OrchestratorLifecycle.RUNNING)
  })

  it('rejects a WAL snapshot with a mismatched token', () => {
    orchestrator = new WorkoutOrchestrator()
    const wal = {
      sessionToken: 'other-token',
      status: 'RUNNING' as const,
      currentIntervalIndex: 0,
      elapsedSecondsInCurrentInterval: 0,
      totalElapsedSeconds: 0,
      lastUpdatedTimestamp: 0,
    }

    expect(() =>
      orchestrator?.reconstructSessionFromWAL(context(), wal)
    ).toThrow('Token integrity check failed')
  })
})
