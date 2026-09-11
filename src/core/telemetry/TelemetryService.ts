import type { CompletedSessionRecord } from '../StorageTypes'
import { IndexedDBAdapter } from '../storage/IndexedDBAdapter'

export class TelemetryService {
  private adapter: IndexedDBAdapter

  constructor(adapter?: IndexedDBAdapter) {
    this.adapter = adapter || new IndexedDBAdapter()
  }

  public async stagePendingSessionAsync(
    record: Omit<CompletedSessionRecord, 'telemetryStatus'> & {
      telemetryStatus?: CompletedSessionRecord['telemetryStatus']
    }
  ): Promise<CompletedSessionRecord> {
    const pendingRecord: CompletedSessionRecord = {
      ...record,
      telemetryStatus: 'PENDING_TELEMETRY',
    }
    await this.adapter.commitCompletedWorkoutAsync(pendingRecord)
    return pendingRecord
  }

  public async sealSessionTelemetryAsync(
    sessionToken: string,
    isStiffOrSore: boolean,
    isConservative = false
  ): Promise<CompletedSessionRecord | null> {
    const record = await this.adapter.getSessionByTokenAsync(sessionToken)
    if (!record) {
      return null
    }

    const updatedRecord: CompletedSessionRecord = {
      ...record,
      userFlaggedStiffOrSore: isStiffOrSore,
      telemetryStatus: isConservative ? 'SEALED_CONSERVATIVE' : 'SEALED',
    }

    await this.adapter.commitCompletedWorkoutAsync(updatedRecord)
    return updatedRecord
  }
}
