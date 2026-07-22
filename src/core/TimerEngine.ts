import type { WorkoutInterval, TimerEngineDelegate } from './EngineTypes'

export class TimerEngine {
  private intervals: WorkoutInterval[]
  private delegate: TimerEngineDelegate | null
  private intervalId: ReturnType<typeof setInterval> | null = null

  private startAnchorHardwareTimestamp = 0
  private pauseAnchorTimestamp = 0
  private isPaused = false
  private isRunning = false

  private currentIntervalIndex = 0
  private intervalStartSecs: number[] = []
  private totalDurationSeconds = 0

  constructor(intervals: WorkoutInterval[], delegate: TimerEngineDelegate) {
    this.intervals = [...intervals]
    this.delegate = delegate
    this.precalculateIntervals()
  }

  private precalculateIntervals(): void {
    let currentStart = 0
    this.intervalStartSecs = []
    for (const interval of this.intervals) {
      this.intervalStartSecs.push(currentStart)
      currentStart += interval.durationSeconds
    }
    this.totalDurationSeconds = currentStart
  }

  public start(): void {
    if (this.isRunning) {
      return
    }
    this.isRunning = true
    this.isPaused = false
    this.currentIntervalIndex = 0
    this.startAnchorHardwareTimestamp = performance.now()
    this.startTicker()
  }

  public pause(): void {
    if (!this.isRunning || this.isPaused) {
      return
    }
    this.isPaused = true
    this.pauseAnchorTimestamp = performance.now()
    this.stopTicker()
  }

  public resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return
    }
    this.isPaused = false
    const pauseDuration = performance.now() - this.pauseAnchorTimestamp
    this.startAnchorHardwareTimestamp += pauseDuration
    this.startTicker()
  }

  private startTicker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.intervalId = setInterval((): void => {
      this.tick()
    }, 250)
  }

  private stopTicker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  public tick(): void {
    if (!this.isRunning || this.isPaused || !this.delegate) {
      return
    }

    const elapsedMs = performance.now() - this.startAnchorHardwareTimestamp
    const totalElapsedSeconds = Math.floor(elapsedMs / 1000)

    if (totalElapsedSeconds >= this.totalDurationSeconds) {
      this.isRunning = false
      this.stopTicker()
      this.delegate.onWorkoutComplete()
      return
    }

    // Find the correct current interval index
    let newIndex = 0
    for (let i = 0; i < this.intervalStartSecs.length; i++) {
      if (totalElapsedSeconds >= this.intervalStartSecs[i]) {
        newIndex = i
      } else {
        break
      }
    }

    if (newIndex !== this.currentIntervalIndex) {
      this.currentIntervalIndex = newIndex
      this.delegate.onIntervalTransition(newIndex)
    }

    const elapsedInInterval =
      totalElapsedSeconds - this.intervalStartSecs[this.currentIntervalIndex]

    this.delegate.onTick(elapsedInInterval, totalElapsedSeconds)
  }

  public restoreState(
    totalElapsedSeconds: number,
    currentIntervalIndex: number,
    status: 'RUNNING' | 'PAUSED'
  ): void {
    this.currentIntervalIndex = currentIntervalIndex
    if (status === 'RUNNING') {
      this.isRunning = true
      this.isPaused = false
      // Recalibrate hardware anchor: current time minus recorded elapsed ms
      this.startAnchorHardwareTimestamp =
        performance.now() - totalElapsedSeconds * 1000
      this.startTicker()
    } else if (status === 'PAUSED') {
      this.isRunning = true
      this.isPaused = true
      this.startAnchorHardwareTimestamp =
        performance.now() - totalElapsedSeconds * 1000
      this.pauseAnchorTimestamp = performance.now()
      this.stopTicker()
    }
  }

  public dispose(): void {
    this.stopTicker()
    this.delegate = null
    this.intervals = []
    this.intervalStartSecs = []
  }
}
