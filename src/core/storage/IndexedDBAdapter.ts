import type { CompletedSessionRecord } from '../StorageTypes'

export class IndexedDBAdapter {
  private readonly DB_NAME = 'ya-5bx'
  private readonly DB_VERSION = 1
  private db: IDBDatabase | null = null

  public async openAsync(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', {
            keyPath: 'sessionToken',
          })
          store.createIndex('byLevel', ['chartNumber', 'levelString'], {
            unique: false,
          })
          store.createIndex('byDate', 'completedAt', { unique: false })
        }
      }

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }
    })
  }

  public async commitCompletedWorkoutAsync(
    record: CompletedSessionRecord
  ): Promise<void> {
    const db = await this.openAsync()
    return new Promise((resolve, reject) => {
      // Phase 1: Write record to IndexedDB
      const tx = db.transaction(['sessions'], 'readwrite')
      const store = tx.objectStore('sessions')
      const request = store.put(record)

      request.onsuccess = () => {
        // Phase 2: Await success, then clear local storage state/WAL
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('ya_5bx_wal')
          localStorage.removeItem(`workout_checkpoint_${record.sessionToken}`)
        }
        resolve()
      }

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  public async getSessionByTokenAsync(
    sessionToken: string
  ): Promise<CompletedSessionRecord | null> {
    const db = await this.openAsync()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions'], 'readonly')
      const store = tx.objectStore('sessions')
      const request = store.get(sessionToken)

      request.onsuccess = () => {
        resolve((request.result as CompletedSessionRecord) || null)
      }

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  public async getAllSessionsAsync(): Promise<CompletedSessionRecord[]> {
    const db = await this.openAsync()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions'], 'readonly')
      const store = tx.objectStore('sessions')
      const index = store.index('byDate')
      const request = index.getAll()

      request.onsuccess = () => {
        const records = (request.result as CompletedSessionRecord[]) || []
        // Sort ascending by completedAt
        records.sort((a, b) => a.completedAt - b.completedAt)
        resolve(records)
      }

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }
}
