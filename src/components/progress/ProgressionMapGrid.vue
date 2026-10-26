<template>
  <v-skeleton-loader
    v-if="!isHydrated"
    type="table-row@6"
    color="surface"
    class="mb-6"
  />
  <v-card
    v-else
    color="surface"
    rounded="lg"
    class="border-surface-variant overflow-hidden mb-6"
  >
    <div
      class="pa-6 border-b-surface-variant d-flex align-center justify-space-between"
    >
      <h3 class="fc-section text-on-surface text-uppercase">
        STRENGTH HIERARCHY
      </h3>
      <span class="fc-caption text-content-secondary text-uppercase"
        >CHART C1 - C6</span
      >
    </div>

    <div class="pa-4 pa-md-8 overflow-x-auto no-scrollbar">
      <div class="grid-container mx-auto">
        <!-- Header Row -->
        <div class="d-flex align-center justify-center"></div>
        <div
          v-for="grade in grades"
          :key="grade"
          class="fc-caption text-content-tertiary text-center header-cell"
        >
          {{ grade }}
        </div>

        <!-- Matrix Rows C1 through C6 -->
        <template v-for="chart in 6" :key="chart">
          <div class="fc-caption text-content-secondary d-flex align-center">
            C{{ chart }}
          </div>
          <div
            v-for="(grade, gIdx) in grades"
            :key="grade"
            class="d-flex align-center justify-center"
          >
            <div
              :class="getCellClass(chart, gIdx)"
              class="progression-cell rounded-lg d-flex align-center justify-center cursor-pointer"
              :title="`Chart ${chart} · ${grade} (${getCellState(chart, gIdx)})`"
            >
              <v-icon
                v-if="getCellState(chart, gIdx) === 'completed'"
                size="14"
                color="secondary"
                >mdi-check</v-icon
              >
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Legend -->
    <div
      class="pa-6 bg-surface-elevated d-flex flex-wrap ga-6 align-center justify-center border-top-accent"
    >
      <div class="d-flex align-center ga-2">
        <div class="rounded legend-current"></div>
        <span class="fc-caption text-on-surface">Current Session</span>
      </div>
      <div class="d-flex align-center ga-2">
        <div class="rounded legend-done d-flex align-center justify-center">
          <v-icon size="10" color="secondary">mdi-check</v-icon>
        </div>
        <span class="fc-caption text-on-surface">Done</span>
      </div>
      <div class="d-flex align-center ga-2">
        <div class="rounded legend-goal"></div>
        <span class="fc-caption text-on-surface">End Goal</span>
      </div>
      <div class="d-flex align-center ga-2">
        <div class="rounded legend-locked"></div>
        <span class="fc-caption text-on-surface">Locked</span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    currentLevelId: string
    goalLevelId: string
    completedLevelIds?: string[]
    isHydrated: boolean
  }>()

  const grades = [
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

  const parseLevelId = (levelId: string) => {
    if (!levelId || !levelId.includes('_')) return { chart: 1, levelIdx: 0 }
    const [cStr, gStr] = levelId.split('_')
    const chart = parseInt(cStr.replace('C', ''), 10) || 1
    const levelIdx = grades.indexOf(gStr) >= 0 ? grades.indexOf(gStr) : 0
    return { chart, levelIdx }
  }

  const currentParsed = computed(() => parseLevelId(props.currentLevelId))
  const goalParsed = computed(() => parseLevelId(props.goalLevelId))

  function getCellState(chart: number, levelIdx: number): string {
    const curChart = currentParsed.value.chart
    const curLevelIdx = currentParsed.value.levelIdx
    const gChart = goalParsed.value.chart
    const gLevelIdx = goalParsed.value.levelIdx

    const levelStr = `C${chart}_${grades[levelIdx]}`
    const isExplicitlyCompleted =
      props.completedLevelIds && props.completedLevelIds.includes(levelStr)

    if (chart === curChart && levelIdx === curLevelIdx) {
      return 'current'
    }
    if (
      isExplicitlyCompleted ||
      chart < curChart ||
      (chart === curChart && levelIdx < curLevelIdx)
    ) {
      return 'completed'
    }
    if (chart === gChart && levelIdx === gLevelIdx) {
      return 'goal'
    }
    return 'locked'
  }

  function getCellClass(
    chart: number,
    levelIdx: number
  ): Record<string, boolean> {
    const state = getCellState(chart, levelIdx)
    return {
      'cell-current': state === 'current',
      'cell-completed': state === 'completed',
      'cell-goal': state === 'goal',
      'cell-locked': state === 'locked',
    }
  }
</script>
