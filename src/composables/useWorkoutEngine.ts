import { ref, shallowRef, readonly, type DeepReadonly, type Ref } from 'vue'
import { WorkoutOrchestrator } from '../core/WorkoutOrchestrator'
import {
  type SessionSnapshot,
  type WorkoutGenerationContext,
  type WorkoutStateSnapshot,
  type IWorkoutStrategy,
  type IPersistenceAdapter,
  OrchestratorLifecycle,
} from '../core/EngineTypes'

// Global orchestrator instance and context cache
let globalOrchestrator: WorkoutOrchestrator | null = null
let lastContext: WorkoutGenerationContext | null = null

export function useWorkoutEngine(
  strategy?: IWorkoutStrategy,
  persistenceAdapter?: IPersistenceAdapter
) {
  if (!globalOrchestrator) {
    globalOrchestrator = new WorkoutOrchestrator(strategy, persistenceAdapter)
  }

  // Shallow Ref binding for atomic O(1) immutable snapshot updates
  const currentSnapshot: Ref<SessionSnapshot | null> = shallowRef(
    globalOrchestrator ? globalOrchestrator.getSessionSnapshot() : null
  )
  const elapsedSeconds = ref(
    globalOrchestrator
      ? globalOrchestrator.getSessionSnapshot().elapsedSecondsInCurrentInterval
      : 0
  )

  let subscriberToken: string | null = null

  const mountEngine = (): void => {
    if (!subscriberToken && globalOrchestrator) {
      subscriberToken = globalOrchestrator.subscribe(
        (snapshot: SessionSnapshot): void => {
          elapsedSeconds.value = snapshot.elapsedSecondsInCurrentInterval
          if (
            !currentSnapshot.value ||
            snapshot.currentIntervalIndex !==
              currentSnapshot.value.currentIntervalIndex ||
            snapshot.status !== currentSnapshot.value.status ||
            snapshot.sessionToken !== currentSnapshot.value.sessionToken
          ) {
            currentSnapshot.value = snapshot
          }
        }
      )
    }
  }

  const unmountEngine = (): void => {
    if (subscriberToken && globalOrchestrator) {
      globalOrchestrator.unsubscribe(subscriberToken)
      subscriberToken = null
    }
  }

  const initializeSession = (context: WorkoutGenerationContext): void => {
    lastContext = context
    mountEngine()
    globalOrchestrator?.initializeSession(context)
  }

  const startWorkout = (): void => {
    mountEngine()
    globalOrchestrator?.startWorkout()
  }

  const pauseWorkout = (): void => {
    globalOrchestrator?.pauseWorkout()
  }

  const resumeWorkout = (): void => {
    globalOrchestrator?.resumeWorkout()
  }

  const confirmReps = (reps: number): void => {
    globalOrchestrator?.confirmReps(reps)
  }

  const finishSession = (aerobicCompleted: boolean): void => {
    globalOrchestrator?.finishSession(aerobicCompleted)
  }

  const abandonCurrentSessionAsync = async (): Promise<void> => {
    if (globalOrchestrator) {
      await globalOrchestrator.abandonCurrentSessionAsync()
      currentSnapshot.value = globalOrchestrator.getSessionSnapshot()
    }
  }

  const restartWorkout = (context?: WorkoutGenerationContext): void => {
    const ctx = context || lastContext
    if (ctx && globalOrchestrator) {
      const currentLifecycle = globalOrchestrator.getLifecycle()
      if (
        currentLifecycle === OrchestratorLifecycle.RUNNING ||
        currentLifecycle === OrchestratorLifecycle.PAUSED
      ) {
        if (currentLifecycle === OrchestratorLifecycle.RUNNING) {
          globalOrchestrator.pauseWorkout()
        }
      }
      globalOrchestrator.dispose()
      subscriberToken = null
      mountEngine()
      const newCtx = {
        ...ctx,
        sessionToken: crypto.randomUUID(),
      }
      lastContext = newCtx
      globalOrchestrator.initializeSession(newCtx)
      globalOrchestrator.startWorkout()
    }
  }

  const reconstructSessionFromWAL = (
    context: WorkoutGenerationContext,
    savedSnapshot: WorkoutStateSnapshot
  ): void => {
    lastContext = context
    mountEngine()
    globalOrchestrator?.reconstructSessionFromWAL(context, savedSnapshot)
  }

  // Ensure engine is mounted
  mountEngine()

  return {
    snapshot: readonly(currentSnapshot) as DeepReadonly<
      Ref<SessionSnapshot | null>
    >,
    elapsedSeconds: readonly(elapsedSeconds) as DeepReadonly<Ref<number>>,
    mountEngine,
    unmountEngine,
    initializeSession,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    confirmReps,
    finishSession,
    restartWorkout,
    abandonCurrentSessionAsync,
    reconstructSessionFromWAL,
    getLifecycle: () => globalOrchestrator?.getLifecycle(),
  }
}
