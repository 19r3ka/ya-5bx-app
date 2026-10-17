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
import { useUserStore } from './useUserStore'

export const useProgressionStore = defineStore('progression', () => {
  const adapter = new IndexedDBAdapter()
  const telemetryService = new TelemetryService(adapter)
  const validator = new ProgressionValidator()

  const isHydrated = ref(false)
  const rawHistory = shallowRef<CompletedSessionRecord[]>([])

  const currentChart = ref<number>(1)
  const currentLevel = ref('D-')

  const initAsync = async (): Promise<void> => {
    const userStore = useUserStore()
    const rawLevel = userStore.profile?.currentLevel ?? 'C1_D-'
    const [chartStr, levelStr] = rawLevel.split('_')
    currentChart.value = parseInt(chartStr.replace('C', ''), 10) || 1
    currentLevel.value = levelStr || 'D-'

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

    const userStore = useUserStore()
    const userProfile: UserProfile = {
      age: userStore.profile?.age ?? 30,
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

    return validator.validate(userProfile, snapshot)
  })

  return {
    isHydrated,
    rawHistory,
    currentChart,
    currentLevel,
    initAsync,
    reloadHistoryAsync,
    validationResult,
    adapter,
    telemetryService,
  }
})
