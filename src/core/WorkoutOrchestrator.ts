import type {
  WorkoutGenerationContext,
  WorkoutStateSnapshot,
  SessionSnapshot,
  IPersistenceAdapter,
  TimerEngineDelegate,
  WorkoutInterval,
  IWorkoutStrategy,
} from './EngineTypes'
import { OrchestratorLifecycle } from './EngineTypes'
import { TimerEngine } from './TimerEngine'
import { ClassicRCAFStrategy } from './ClassicRCAFStrategy'

export class WorkoutOrchestrator implements TimerEngineDelegate {
  private lifecycle: OrchestratorLifecycle = OrchestratorLifecycle.UNINITIALIZED
  private timerEngine: TimerEngine | null = null
  private strategy: IWorkoutStrategy
  private persistenceAdapter: IPersistenceAdapter | null = null

  private currentSessionToken = ''
  private currentIntervalIndex = 0
  private elapsedSecondsInCurrentInterval = 0
  private totalElapsedSeconds = 0
  private lastUpdatedTimestamp = 0
  private intervals: WorkoutInterval[] = []
  private loggedReps: number[] = []
  private aerobicCompleted: boolean | undefined = undefined

  private subscribers = new Map<string, (snapshot: SessionSnapshot) => void>()

  constructor(
    strategy?: IWorkoutStrategy,
    persistenceAdapter?: IPersistenceAdapter
  ) {
    this.strategy = strategy || new ClassicRCAFStrategy()
    if (persistenceAdapter) {
      this.persistenceAdapter = persistenceAdapter
    }
  }

  public getLifecycle(): OrchestratorLifecycle {
    return this.lifecycle
  }

  public initializeSession(context: WorkoutGenerationContext): void {
    if (this.lifecycle === OrchestratorLifecycle.TEARDOWN_PENDING) {
      throw new Error('Cannot initialize during teardown')
    }

    if (
      this.lifecycle === OrchestratorLifecycle.RUNNING ||
      this.lifecycle === OrchestratorLifecycle.PAUSED ||
      this.lifecycle === OrchestratorLifecycle.READY
    ) {
      throw new Error('Session is already active')
    }

    this.currentSessionToken = context.sessionToken
    this.currentIntervalIndex = 0
    this.elapsedSecondsInCurrentInterval = 0
    this.totalElapsedSeconds = 0
    this.lastUpdatedTimestamp = Date.now()

    this.intervals = this.strategy.generateWorkout(context)
    this.loggedReps = []
    this.aerobicCompleted = undefined
    this.timerEngine = new TimerEngine(this.intervals, this)
    this.timerEngine.setGatedIndices(
      this.intervals
        .map((interval, index) => ({ interval, index }))
        .filter(({ interval }) => interval.requiresRepConfirmation === true)
        .map(({ index }) => index)
    )
    this.lifecycle = OrchestratorLifecycle.READY

    this.broadcastSnapshot()
  }

  public startWorkout(): void {
    if (this.lifecycle !== OrchestratorLifecycle.READY) {
      throw new Error('Engine not ready')
    }
    if (!this.timerEngine) {
      throw new Error('Timer engine not initialized')
    }
    this.lifecycle = OrchestratorLifecycle.RUNNING
    this.timerEngine.start()
    this.broadcastSnapshot()
  }

  public pauseWorkout(): void {
    if (this.lifecycle !== OrchestratorLifecycle.RUNNING) {
      throw new Error('Engine not running')
    }
    if (!this.timerEngine) {
      throw new Error('Timer engine not initialized')
    }
    this.lifecycle = OrchestratorLifecycle.PAUSED
    this.timerEngine.pause()
    this.broadcastSnapshot()
  }

  public resumeWorkout(): void {
    if (this.lifecycle !== OrchestratorLifecycle.PAUSED) {
      throw new Error('Engine not paused')
    }
    if (!this.timerEngine) {
      throw new Error('Timer engine not initialized')
    }
    this.lifecycle = OrchestratorLifecycle.RUNNING
    this.timerEngine.resume()
    this.broadcastSnapshot()
  }

  /**
   * Confirms the reps performed for the interval that just ended and releases
   * the REST hold so the workout advances to the next interval.
   */
  public confirmReps(reps: number): void {
    if (this.lifecycle !== OrchestratorLifecycle.REST || !this.timerEngine) {
      return
    }
    this.loggedReps[this.currentIntervalIndex] = reps
    // Set RUNNING before releasing the gate so the transition broadcast that
    // fires from resumeFromRest() reports the correct status.
    this.lifecycle = OrchestratorLifecycle.RUNNING
    this.timerEngine.resumeFromRest()
    this.lastUpdatedTimestamp = Date.now()
    this.broadcastSnapshot()
  }

  /**
   * Ends the session immediately, recording whether the final aerobic block
   * was completed in full or stopped early.
   */
  public finishSession(aerobicCompleted: boolean): void {
    this.aerobicCompleted = aerobicCompleted
    if (this.timerEngine) {
      this.timerEngine.dispose()
      this.timerEngine = null
    }
    this.lifecycle = OrchestratorLifecycle.COMPLETED
    this.lastUpdatedTimestamp = Date.now()
    this.broadcastSnapshot()
  }

  public async abandonCurrentSessionAsync(): Promise<void> {
    if (this.lifecycle === OrchestratorLifecycle.TEARDOWN_PENDING) {
      return
    }

    this.lifecycle = OrchestratorLifecycle.TEARDOWN_PENDING

    if (this.timerEngine) {
      this.timerEngine.dispose()
      this.timerEngine = null
    }

    const snapshot = this.getStateSnapshot()

    const savePromise = this.persistenceAdapter
      ? this.persistenceAdapter.saveSessionAsync(
          this.currentSessionToken,
          snapshot
        )
      : Promise.resolve()

    const timeoutPromise = new Promise<void>((_, reject): void => {
      setTimeout((): void => {
        reject(new Error('Storage mutation timed out'))
      }, 2000)
    })

    try {
      await Promise.race([savePromise, timeoutPromise])
    } catch (error) {
      console.error(
        'Out-of-band telemetry exception in abandonCurrentSessionAsync:',
        error
      )
    } finally {
      this.lifecycle = OrchestratorLifecycle.UNINITIALIZED
      this.broadcastSnapshot()
    }
  }

  private resolveStatus():
    | 'IDLE'
    | 'RUNNING'
    | 'PAUSED'
    | 'REST'
    | 'COMPLETED' {
    switch (this.lifecycle) {
      case OrchestratorLifecycle.RUNNING:
        return 'RUNNING'
      case OrchestratorLifecycle.PAUSED:
        return 'PAUSED'
      case OrchestratorLifecycle.REST:
        return 'REST'
      case OrchestratorLifecycle.COMPLETED:
        return 'COMPLETED'
      default:
        return 'IDLE'
    }
  }

  public getStateSnapshot(): WorkoutStateSnapshot {
    return {
      sessionToken: this.currentSessionToken,
      status: this.resolveStatus(),
      currentIntervalIndex: this.currentIntervalIndex,
      elapsedSecondsInCurrentInterval: this.elapsedSecondsInCurrentInterval,
      totalElapsedSeconds: this.totalElapsedSeconds,
      lastUpdatedTimestamp: this.lastUpdatedTimestamp,
      aerobicCompleted: this.aerobicCompleted,
      loggedReps: [...this.loggedReps],
    }
  }

  public getSessionSnapshot(): SessionSnapshot {
    return {
      sessionToken: this.currentSessionToken,
      status: this.resolveStatus(),
      currentIntervalIndex: this.currentIntervalIndex,
      elapsedSecondsInCurrentInterval: this.elapsedSecondsInCurrentInterval,
      totalElapsedSeconds: this.totalElapsedSeconds,
      lastUpdatedTimestamp: this.lastUpdatedTimestamp,
      aerobicCompleted: this.aerobicCompleted,
      loggedReps: [...this.loggedReps],
      intervals: [...this.intervals],
    }
  }

  public subscribe(callback: (snapshot: SessionSnapshot) => void): string {
    const token = Math.random().toString(36).substring(2, 9)
    this.subscribers.set(token, callback)
    try {
      callback(this.getSessionSnapshot())
    } catch (error) {
      console.error('Observer callback error during subscription:', error)
    }
    return token
  }

  public unsubscribe(token: string): void {
    this.subscribers.delete(token)
  }

  public getSubscriberCount(): number {
    return this.subscribers.size
  }

  private broadcastSnapshot(): void {
    const snapshot = this.getSessionSnapshot()
    for (const [token, callback] of this.subscribers.entries()) {
      try {
        callback(snapshot)
      } catch (error) {
        console.error(
          `Observer callback error for subscriber token ${token}:`,
          error
        )
      }
    }
  }

  public onTick(
    elapsedSecondsInCurrentInterval: number,
    totalElapsedSeconds: number
  ): void {
    this.elapsedSecondsInCurrentInterval = elapsedSecondsInCurrentInterval
    this.totalElapsedSeconds = totalElapsedSeconds
    this.lastUpdatedTimestamp = Date.now()
    this.broadcastSnapshot()
  }

  public onIntervalTransition(newIntervalIndex: number): void {
    this.currentIntervalIndex = newIntervalIndex
    this.elapsedSecondsInCurrentInterval = 0
    this.lastUpdatedTimestamp = Date.now()

    // OS Memory Eviction Losses checkpoint ledger write
    const snapshot = this.getStateSnapshot()
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          `workout_checkpoint_${this.currentSessionToken}`,
          JSON.stringify(snapshot)
        )
      } catch (error) {
        console.error('Failed to write checkpoint ledger:', error)
      }
    }

    this.broadcastSnapshot()
  }

  public onRestRequired(intervalIndex: number): void {
    this.currentIntervalIndex = intervalIndex
    // Snap the frozen timer display to the interval's full duration (00:00).
    this.elapsedSecondsInCurrentInterval =
      this.intervals[intervalIndex]?.durationSeconds ??
      this.elapsedSecondsInCurrentInterval
    this.totalElapsedSeconds = this.intervals
      .slice(0, intervalIndex + 1)
      .reduce((acc, interval) => acc + interval.durationSeconds, 0)
    this.lifecycle = OrchestratorLifecycle.REST
    this.lastUpdatedTimestamp = Date.now()
    this.broadcastSnapshot()
  }

  public onWorkoutComplete(): void {
    this.lifecycle = OrchestratorLifecycle.COMPLETED
    this.lastUpdatedTimestamp = Date.now()
    this.broadcastSnapshot()
  }

  public reconstructSessionFromWAL(
    context: WorkoutGenerationContext,
    savedSnapshot: WorkoutStateSnapshot
  ): void {
    if (context.sessionToken !== savedSnapshot.sessionToken) {
      throw new Error('Token integrity check failed')
    }

    // 1. Initialize session using context
    this.initializeSession(context)

    // 2. Override internal state
    this.currentIntervalIndex = savedSnapshot.currentIntervalIndex
    this.elapsedSecondsInCurrentInterval =
      savedSnapshot.elapsedSecondsInCurrentInterval
    this.totalElapsedSeconds = savedSnapshot.totalElapsedSeconds
    this.lastUpdatedTimestamp = Date.now()
    this.loggedReps = savedSnapshot.loggedReps
      ? [...savedSnapshot.loggedReps]
      : []
    this.aerobicCompleted = savedSnapshot.aerobicCompleted

    // 3. Recalibrate and restore state in TimerEngine
    if (this.timerEngine) {
      if (savedSnapshot.status === 'RUNNING') {
        this.lifecycle = OrchestratorLifecycle.RUNNING
        this.timerEngine.restoreState(
          this.totalElapsedSeconds,
          this.currentIntervalIndex,
          'RUNNING'
        )
      } else if (savedSnapshot.status === 'PAUSED') {
        this.lifecycle = OrchestratorLifecycle.PAUSED
        this.timerEngine.restoreState(
          this.totalElapsedSeconds,
          this.currentIntervalIndex,
          'PAUSED'
        )
      } else if (savedSnapshot.status === 'REST') {
        this.lifecycle = OrchestratorLifecycle.REST
        this.timerEngine.restoreRestHold(this.currentIntervalIndex)
      } else if (savedSnapshot.status === 'COMPLETED') {
        this.lifecycle = OrchestratorLifecycle.COMPLETED
      } else {
        this.lifecycle = OrchestratorLifecycle.READY
      }
    }

    // 4. Emit validated snapshot
    this.broadcastSnapshot()
  }

  public dispose(): void {
    if (this.timerEngine) {
      this.timerEngine.dispose()
      this.timerEngine = null
    }
    this.subscribers.clear()
    this.intervals = []
    this.lifecycle = OrchestratorLifecycle.UNINITIALIZED
    this.currentSessionToken = ''
    this.currentIntervalIndex = 0
    this.elapsedSecondsInCurrentInterval = 0
    this.totalElapsedSeconds = 0
    this.lastUpdatedTimestamp = 0
    this.loggedReps = []
    this.aerobicCompleted = undefined
  }
}
