export type TelemetryStatus =
  | 'PENDING_TELEMETRY'
  | 'SEALED_USER_CONFIRMED'
  | 'SEALED_CONSERVATIVE'

export interface CompletedSessionRecord {
  version: number
  sessionToken: string
  completedAt: number
  chartNumber: number
  levelString: string
  durationSeconds: number
  telemetryStatus: TelemetryStatus
  userFlaggedStiffOrSore?: boolean
  /**
   * Whether the final aerobic block was completed in full. Sessions stopped
   * early do not count toward level progression.
   */
  aerobicCompleted: boolean
  /** Reps confirmed per gated exercise (index-aligned with the intervals). */
  loggedReps?: number[]
}
