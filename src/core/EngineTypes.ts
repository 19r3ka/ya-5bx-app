export enum AerobicOption {
  STATIONARY_RUN = 'STATIONARY_RUN',
  OUTDOOR_RUN_1_MILE = 'OUTDOOR_RUN_1_MILE',
  WALK_2_MILES = 'WALK_2_MILES',
}

export enum OrchestratorLifecycle {
  UNINITIALIZED = 'UNINITIALIZED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  TEARDOWN_PENDING = 'TEARDOWN_PENDING',
  COMPLETED = 'COMPLETED',
}

export type Grade =
  | 'D-'
  | 'D'
  | 'D+'
  | 'C-'
  | 'C'
  | 'C+'
  | 'B-'
  | 'B'
  | 'B+'
  | 'A-'
  | 'A'
  | 'A+'

export interface UserProfile {
  age: number
  name?: string
}

export interface LevelHistorySnapshot {
  currentChart: number
  currentLevel: string
  verifiedCompletedSessionsAtCurrentLevel: number
  userFlaggedStiffOrSore: boolean
}

export interface ValidationResult {
  isEligible: boolean
  reasonCode:
    | 'ELIGIBLE'
    | 'VOLUME_QUOTA_INCOMPLETE'
    | 'USER_TELEMETRY_RESTRICTION'
    | 'INVALID_AGE'
  requiredSessions: number
  remainingSessions: number
}

export interface WorkoutInterval {
  exerciseId: string
  durationSeconds: number
  displayName: string
  description: string
  translationKey?: string
  /**
   * Target repetitions for rep-based exercises. Omitted for timed/aerobic
   * intervals (e.g. the run/walk block) which are not counted in reps.
   */
  targetReps?: number
}

export interface WorkoutStateSnapshot {
  sessionToken: string
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  currentIntervalIndex: number
  elapsedSecondsInCurrentInterval: number
  totalElapsedSeconds: number
  lastUpdatedTimestamp: number
}

export interface SessionSnapshot extends WorkoutStateSnapshot {
  intervals: WorkoutInterval[]
}

export interface WorkoutGenerationContext {
  sessionToken: string
  profile: UserProfile
  chartNumber: number
  levelString: string
  aerobicSelection: AerobicOption
  isModernSafeMode: boolean
}

export interface TimerEngineDelegate {
  onTick(
    elapsedSecondsInCurrentInterval: number,
    totalElapsedSeconds: number
  ): void
  onIntervalTransition(newIntervalIndex: number): void
  onWorkoutComplete(): void
}

export interface IWorkoutStrategy {
  generateWorkout(context: WorkoutGenerationContext): WorkoutInterval[]
}

export interface IPersistenceAdapter {
  saveSessionAsync(
    sessionToken: string,
    snapshot: WorkoutStateSnapshot
  ): Promise<void>
}
