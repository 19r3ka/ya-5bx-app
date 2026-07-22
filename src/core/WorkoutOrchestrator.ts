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
    this.timerEngine = new TimerEngine(this.intervals, this)
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

  public getStateSnapshot(): WorkoutStateSnapshot {
    let status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' = 'IDLE'
    if (this.lifecycle === OrchestratorLifecycle.RUNNING) {
      status = 'RUNNING'
    } else if (this.lifecycle === OrchestratorLifecycle.PAUSED) {
      status = 'PAUSED'
    } else if (this.lifecycle === OrchestratorLifecycle.COMPLETED) {
      status = 'COMPLETED'
    }

    return {
      sessionToken: this.currentSessionToken,
      status,
      currentIntervalIndex: this.currentIntervalIndex,
      elapsedSecondsInCurrentInterval: this.elapsedSecondsInCurrentInterval,
      totalElapsedSeconds: this.totalElapsedSeconds,
      lastUpdatedTimestamp: this.lastUpdatedTimestamp,
    }
  }

  public getSessionSnapshot(): SessionSnapshot {
    let status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' = 'IDLE'
    if (this.lifecycle === OrchestratorLifecycle.RUNNING) {
      status = 'RUNNING'
    } else if (this.lifecycle === OrchestratorLifecycle.PAUSED) {
      status = 'PAUSED'
    } else if (this.lifecycle === OrchestratorLifecycle.COMPLETED) {
      status = 'COMPLETED'
    }

    return {
      sessionToken: this.currentSessionToken,
      status,
      currentIntervalIndex: this.currentIntervalIndex,
      elapsedSecondsInCurrentInterval: this.elapsedSecondsInCurrentInterval,
      totalElapsedSeconds: this.totalElapsedSeconds,
      lastUpdatedTimestamp: this.lastUpdatedTimestamp,
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
  }
}
