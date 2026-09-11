import type { CompletedSessionRecord } from '../StorageTypes'

export class HistoryAggregator {
  public static calculateContiguousVolume(
    history: CompletedSessionRecord[],
    targetChart: number,
    targetLevel: string
  ): number {
    let contiguousCount = 0

    // Iterate history strictly backwards (newest first)
    for (let i = history.length - 1; i >= 0; i--) {
      const record = history[i]
      if (
        record.chartNumber === targetChart &&
        record.levelString === targetLevel
      ) {
        contiguousCount++
      } else {
        // CRITICAL: break immediately upon encountering a non-matching record
        break
      }
    }

    return contiguousCount
  }
}
