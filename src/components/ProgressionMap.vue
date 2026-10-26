<script setup lang="ts">
  import { useProgressionStore } from '../stores/useProgressionStore'

  const store = useProgressionStore()

  const levelsOrder = [
    'D-',
    'D',
    'D+',
    'C-',
    'C',
    'C+',
    'B-',
    'B',
    'B+',
    'A-',
    'A',
    'A+',
  ]

  const charts = [1, 2, 3, 4, 5, 6]

  // Helper to determine status of a cell (chartNumber, levelString)
  const getCellState = (chartNum: number, levelStr: string) => {
    const isCurrent =
      store.currentChart === chartNum && store.currentLevel === levelStr

    const isCompleted = store.rawHistory.some(
      (record) =>
        record.chartNumber === chartNum && record.levelString === levelStr
    )

    const isEligible =
      store.validationResult?.isEligible &&
      store.currentChart === chartNum &&
      store.currentLevel === levelStr

    return {
      isCurrent,
      isCompleted,
      isEligible,
    }
  }

  const getCellColor = (chartNum: number, levelStr: string): string => {
    const { isCurrent, isCompleted, isEligible } = getCellState(
      chartNum,
      levelStr
    )

    if (isEligible) return '#FF9800' // Amber
    if (isCurrent) return 'primary'
    if (isCompleted) return '#4CAF50' // Green
    return 'surface'
  }
</script>

<template>
  <div class="progression-map pa-4">
    <div v-if="!store.isHydrated" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <div v-else class="matrix-container">
      <v-typography variant="h5" class="mb-4 text-center font-weight-bold">
        5BX Progression Map (6x12 Matrix)
      </v-typography>

      <v-container fluid class="pa-0">
        <v-row v-for="chartNum in charts" :key="chartNum" class="mb-3">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-3">
              <v-card-title class="text-subtitle-1 font-weight-bold mb-2">
                Chart {{ chartNum }}
              </v-card-title>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="lvl in levelsOrder"
                  :key="lvl"
                  :color="getCellColor(chartNum, lvl)"
                  variant="elevated"
                  class="font-weight-medium"
                >
                  {{ lvl }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>
