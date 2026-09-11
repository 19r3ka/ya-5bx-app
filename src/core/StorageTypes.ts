export type TelemetryStatus =
  | 'PENDING_TELEMETRY'
  | 'SEALED'
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
}
