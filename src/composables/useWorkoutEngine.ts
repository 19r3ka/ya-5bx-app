import { shallowRef, readonly, type DeepReadonly, type Ref } from 'vue'
import { WorkoutOrchestrator } from '../core/WorkoutOrchestrator'
import type {
  SessionSnapshot,
  WorkoutGenerationContext,
  WorkoutStateSnapshot,
  IWorkoutStrategy,
  IPersistenceAdapter,
} from '../core/EngineTypes'

// Global or composable-scoped orchestrator instance
let globalOrchestrator: WorkoutOrchestrator | null = null

export function useWorkoutEngine(
  strategy?: IWorkoutStrategy,
  persistenceAdapter?: IPersistenceAdapter
) {
  if (!globalOrchestrator) {
    globalOrchestrator = new WorkoutOrchestrator(strategy, persistenceAdapter)
  }

  // Shallow Ref binding for atomic O(1) immutable snapshot updates
  const currentSnapshot: Ref<SessionSnapshot | null> = shallowRef(null)

  let subscriberToken: string | null = null

  const mountEngine = (): void => {
    if (!subscriberToken && globalOrchestrator) {
      subscriberToken = globalOrchestrator.subscribe(
        (snapshot: SessionSnapshot): void => {
          currentSnapshot.value = snapshot
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
    mountEngine()
    globalOrchestrator?.initializeSession(context)
  }

  const startWorkout = (): void => {
    globalOrchestrator?.startWorkout()
  }

  const pauseWorkout = (): void => {
    globalOrchestrator?.pauseWorkout()
  }

  const resumeWorkout = (): void => {
    globalOrchestrator?.resumeWorkout()
  }

  const abandonCurrentSessionAsync = async (): Promise<void> => {
    await globalOrchestrator?.abandonCurrentSessionAsync()
  }

  const reconstructSessionFromWAL = (
    context: WorkoutGenerationContext,
    savedSnapshot: WorkoutStateSnapshot
  ): void => {
    mountEngine()
    globalOrchestrator?.reconstructSessionFromWAL(context, savedSnapshot)
  }

  return {
    snapshot: readonly(currentSnapshot) as DeepReadonly<
      Ref<SessionSnapshot | null>
    >,
    mountEngine,
    unmountEngine,
    initializeSession,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    abandonCurrentSessionAsync,
    reconstructSessionFromWAL,
    getLifecycle: () => globalOrchestrator?.getLifecycle(),
  }
}
