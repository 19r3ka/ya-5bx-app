import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type { CompletedSessionRecord } from '../core/StorageTypes'
import { IndexedDBAdapter } from '../core/storage/IndexedDBAdapter'
import { TelemetryService } from '../core/telemetry/TelemetryService'
import { HistoryAggregator } from '../core/storage/HistoryAggregator'
import { ProgressionValidator } from '../core/ProgressionValidator'
import type {
  UserProfile,
  LevelHistorySnapshot,
  ValidationResult,
} from '../core/EngineTypes'

export const useProgressionStore = defineStore('progression', () => {
  const adapter = new IndexedDBAdapter()
  const telemetryService = new TelemetryService(adapter)
  const validator = new ProgressionValidator()

  const isHydrated = ref(false)
  const rawHistory = shallowRef<CompletedSessionRecord[]>([])

  const currentChart = ref(1)
  const currentLevel = ref('D-')
  const userProfile = ref<UserProfile>({ age: 30 })

  const initAsync = async (): Promise<void> => {
    await adapter.openAsync()
    const history = await adapter.getAllSessionsAsync()
    rawHistory.value = history
    isHydrated.value = true
  }

  const reloadHistoryAsync = async (): Promise<void> => {
    const history = await adapter.getAllSessionsAsync()
    rawHistory.value = history
  }

  const validationResult = computed<ValidationResult | null>(() => {
    if (!isHydrated.value) {
      return null
    }

    const contiguousVolume = HistoryAggregator.calculateContiguousVolume(
      rawHistory.value,
      currentChart.value,
      currentLevel.value
    )

    // Check if the last completed session flagged stiff/sore
    const lastSession = rawHistory.value[rawHistory.value.length - 1]
    const userFlaggedStiffOrSore = lastSession?.userFlaggedStiffOrSore ?? false

    const snapshot: LevelHistorySnapshot = {
      currentChart: currentChart.value,
      currentLevel: currentLevel.value,
      verifiedCompletedSessionsAtCurrentLevel: contiguousVolume,
      userFlaggedStiffOrSore,
    }

    return validator.validate(userProfile.value, snapshot)
  })

  return {
    isHydrated,
    rawHistory,
    currentChart,
    currentLevel,
    userProfile,
    initAsync,
    reloadHistoryAsync,
    validationResult,
    adapter,
    telemetryService,
  }
})
