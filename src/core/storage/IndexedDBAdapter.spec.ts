import 'fake-indexeddb/auto'
import { beforeAll, describe, expect, it } from 'vitest'
import { IndexedDBAdapter } from '@/core/storage/IndexedDBAdapter'
import type { CompletedSessionRecord } from '@/core/StorageTypes'

function record(
  overrides: Partial<CompletedSessionRecord> = {}
): CompletedSessionRecord {
  return {
    version: 1,
    sessionToken: crypto.randomUUID(),
    completedAt: 0,
    chartNumber: 3,
    levelString: 'C3_B',
    durationSeconds: 660,
    telemetryStatus: 'SEALED_USER_CONFIRMED',
    aerobicCompleted: true,
    ...overrides,
  }
}

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('ya-5bx')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describe('IndexedDBAdapter', () => {
  beforeAll(async () => {
    await deleteDatabase()
  })

  it('creates the sessions store and its indexes', async () => {
    const adapter = new IndexedDBAdapter()
    const db = await adapter.openAsync()

    expect(db.objectStoreNames.contains('sessions')).toBe(true)

    const tx = db.transaction(['sessions'], 'readonly')
    const store = tx.objectStore('sessions')
    expect(store.keyPath).toBe('sessionToken')
    expect(Array.from(store.indexNames).sort()).toEqual(['byDate', 'byLevel'])

    const byLevel = store.index('byLevel')
    expect(byLevel.keyPath).toEqual(['chartNumber', 'levelString'])
    expect(byLevel.unique).toBe(false)

    const byDate = store.index('byDate')
    expect(byDate.keyPath).toBe('completedAt')
    expect(byDate.unique).toBe(false)
  })

  it('commits a record and reads it back by token', async () => {
    const adapter = new IndexedDBAdapter()
    const session = record({ sessionToken: 'session-1', completedAt: 10 })

    await adapter.commitCompletedWorkoutAsync(session)

    await expect(adapter.getSessionByTokenAsync('session-1')).resolves.toEqual(
      session
    )
    await expect(adapter.getSessionByTokenAsync('missing')).resolves.toBeNull()
  })

  it('returns all sessions in ascending completedAt order', async () => {
    const adapter = new IndexedDBAdapter()
    const newest = record({ sessionToken: 'newest', completedAt: 300 })
    const oldest = record({ sessionToken: 'oldest', completedAt: 100 })
    const middle = record({ sessionToken: 'middle', completedAt: 200 })

    await adapter.commitCompletedWorkoutAsync(newest)
    await adapter.commitCompletedWorkoutAsync(oldest)
    await adapter.commitCompletedWorkoutAsync(middle)

    const sessions = await adapter.getAllSessionsAsync()
    expect(
      sessions
        .filter((session) =>
          ['newest', 'oldest', 'middle'].includes(session.sessionToken)
        )
        .map((session) => session.sessionToken)
    ).toEqual(['oldest', 'middle', 'newest'])
  })

  // Observed timing: the checkpoint key is removed inside `tx.oncomplete`
  // (IndexedDBAdapter.ts:49-52), after `store.put` and immediately before the
  // commit promise resolves. It is not removed in the request's onsuccess.
  it('removes the WAL checkpoint when the transaction completes', async () => {
    const adapter = new IndexedDBAdapter()
    const session = record({ sessionToken: 'wal-session' })
    const key = `workout_checkpoint_${session.sessionToken}`
    localStorage.setItem(key, '{"saved":true}')
    expect(localStorage.getItem(key)).not.toBeNull()

    await adapter.commitCompletedWorkoutAsync(session)

    expect(localStorage.getItem(key)).toBeNull()
  })
})
