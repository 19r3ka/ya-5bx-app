<template>
  <v-container class="pa-0 fill-height flex-column bg-background" fluid>
    <!-- Top AppBar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min position-sticky top-0 z-50"
    >
      <div class="d-flex align-center ga-4">
        <v-icon color="primary">mdi-weight-lifter</v-icon>
        <span class="fc-section text-primary text-uppercase">YA-5BX</span>
      </div>
      <v-btn
        icon="mdi-help-circle-outline"
        variant="text"
        color="on-surface-variant"
        @click="showHelp = true"
      ></v-btn>
    </header>

    <main class="flex-grow-1 w-100 px-6 pb-32 pt-6 mx-auto main-content">
      <!-- Dashboard Header -->
      <div
        class="mb-8 d-flex flex-column flex-md-row justify-space-between align-md-end ga-4"
      >
        <div>
          <h2 class="fc-section text-primary text-uppercase mb-1">
            YOUR PROGRESS
          </h2>
          <p class="fc-body text-content-secondary">
            Current Stage: C{{ progressionStore.currentChart }} | Level
            {{ progressionStore.currentLevel }}
          </p>
        </div>
        <div class="d-flex ga-4">
          <v-card
            color="surface"
            class="pa-4 border-surface-variant rounded-lg d-flex flex-column align-center stat-card"
          >
            <span class="fc-caption text-content-tertiary text-uppercase"
              >Completed</span
            >
            <span class="fc-exercise text-secondary stat-number">{{
              completedSessionsCount
            }}</span>
          </v-card>
          <v-card
            color="surface"
            class="pa-4 border-surface-variant rounded-lg d-flex flex-column align-center stat-card"
          >
            <span class="fc-caption text-content-tertiary text-uppercase"
              >Streak</span
            >
            <span class="fc-exercise text-primary stat-number"
              >{{ streakDays }}d</span
            >
          </v-card>
        </div>
      </div>

      <!-- Progression Map Grid -->
      <ProgressionMapGrid
        :current-level-id="`C${progressionStore.currentChart}_${progressionStore.currentLevel}`"
        :goal-level-id="userStore.profile?.goalLevel ?? 'C3_A+'"
        :completed-level-ids="completedLevelIds"
        :is-hydrated="progressionStore.isHydrated"
      />

      <!-- Stats Grid -->
      <v-row>
        <v-col cols="12" md="8">
          <v-card
            color="surface"
            class="pa-6 border-surface-variant rounded-lg h-100 d-flex flex-column justify-space-between"
          >
            <div class="d-flex align-center justify-space-between mb-4">
              <h4 class="fc-section text-on-surface mb-0 text-uppercase">
                WEEKLY CONSISTENCY
              </h4>
              <span class="fc-caption text-content-secondary"
                >Current Week</span
              >
            </div>
            <!-- Weekly Chart -->
            <div
              class="d-flex align-end justify-space-between ga-2 chart-container"
            >
              <div
                v-for="(col, i) in weeklyData"
                :key="i"
                class="w-100 bg-surface-elevated rounded-t-lg position-relative d-flex flex-column justify-end"
              >
                <span
                  v-if="col.label"
                  class="position-absolute text-center w-100 fc-caption duration-label"
                  :style="{ bottom: col.pct + '%' }"
                >
                  {{ col.label }}
                </span>
                <div
                  :class="
                    col.active
                      ? col.isToday
                        ? 'bg-primary'
                        : 'bg-secondary'
                      : 'bg-surface-variant'
                  "
                  :style="{ height: col.pct + '%' }"
                  class="rounded-t-lg w-100 transition-all"
                ></div>
              </div>
            </div>
            <div
              class="d-flex justify-space-between mt-4 fc-caption text-content-tertiary"
            >
              <span
                v-for="(col, i) in weeklyData"
                :key="i"
                :class="{ 'text-primary font-weight-bold': col.isToday }"
                >{{ col.day }}</span
              >
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="pa-6 rounded-lg border-primary-soft h-100 d-flex flex-column justify-space-between position-relative overflow-hidden milestone-card"
          >
            <div class="position-relative z-10">
              <h4 class="fc-section text-primary mb-2 text-uppercase">
                NEXT MILESTONE
              </h4>
              <p class="fc-body text-on-surface text-sm mb-1">
                Reach <b>{{ nextMilestone.targetName }}</b>
              </p>
              <p class="fc-caption text-content-secondary mb-0">
                {{ nextMilestone.remainingText }}
              </p>
            </div>
            <div class="position-relative mt-6 z-10">
              <div
                class="d-flex justify-space-between fc-caption text-on-surface mb-2"
              >
                <span>Progress</span>
                <span>{{ nextMilestone.pct }}%</span>
              </div>
              <v-progress-linear
                :model-value="nextMilestone.pct"
                color="primary"
                bg-color="surface-elevated"
                rounded
                height="8"
              ></v-progress-linear>
            </div>
            <v-icon size="96" class="position-absolute milestone-icon"
              >mdi-medal</v-icon
            >
          </v-card>
        </v-col>
      </v-row>
    </main>

    <AppHelpDialog v-model="showHelp" />
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import ProgressionMapGrid from '@/components/progress/ProgressionMapGrid.vue'
  import { useProgressionStore } from '@/stores/useProgressionStore'
  import { useUserStore } from '@/stores/useUserStore'
  import { HistoryAggregator } from '@/core/storage/HistoryAggregator'
  import AppHelpDialog from '@/components/common/AppHelpDialog.vue'

  const progressionStore = useProgressionStore()
  const userStore = useUserStore()
  const showHelp = ref(false)

  onMounted(() => {
    if (!progressionStore.isHydrated) {
      progressionStore.initAsync()
    }
  })

  const completedSessionsCount = computed(
    () =>
      progressionStore.rawHistory.filter(
        (s) => s.telemetryStatus !== 'PENDING_TELEMETRY'
      ).length
  )

  const completedLevelIds = computed(() => [
    ...new Set(
      progressionStore.rawHistory
        .filter((s) => s.telemetryStatus !== 'PENDING_TELEMETRY')
        .map((s) => `C${s.chartNumber}_${s.levelString}`)
    ),
  ])

  const streakDays = computed(() => {
    const history = progressionStore.rawHistory.filter(
      (s) => s.telemetryStatus !== 'PENDING_TELEMETRY'
    )
    if (history.length === 0) return 0

    const dates = [
      ...new Set(
        history.map((s) => {
          const d = new Date(s.completedAt)
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
        })
      ),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    let current = new Date()
    current.setHours(0, 0, 0, 0)

    for (const dateStr of dates) {
      const d = new Date(dateStr)
      d.setHours(0, 0, 0, 0)
      const diffDays = Math.round(
        (current.getTime() - d.getTime()) / (1000 * 3600 * 24)
      )
      if (diffDays === 0 || diffDays === 1) {
        streak++
        current = d
      } else {
        break
      }
    }
    return streak
  })

  const weeklyData = computed(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const completed = progressionStore.rawHistory.filter(
      (s) => s.telemetryStatus !== 'PENDING_TELEMETRY'
    )

    return days.map((dayLabel, index) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + index)
      const dayDateStr = `${dayDate.getFullYear()}-${dayDate.getMonth() + 1}-${dayDate.getDate()}`

      const sessionsOnDay = completed.filter((s) => {
        const d = new Date(s.completedAt)
        return (
          `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` === dayDateStr
        )
      })

      const isToday = now.toDateString() === dayDate.toDateString()

      if (sessionsOnDay.length > 0) {
        const totalMinutes = Math.round(
          sessionsOnDay.reduce(
            (acc, s) => acc + (s.durationSeconds || 660),
            0
          ) / 60
        )
        return {
          day: dayLabel,
          pct: Math.min(100, Math.max(35, (totalMinutes / 11) * 100)),
          active: true,
          label: `${totalMinutes}m`,
          isToday,
        }
      }

      return {
        day: dayLabel,
        pct: 10,
        active: false,
        label: '',
        isToday,
      }
    })
  })

  const ladderGrades = [
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

  const nextMilestone = computed(() => {
    const curChart = progressionStore.currentChart
    const curLevel = progressionStore.currentLevel
    const gIdx = ladderGrades.indexOf(curLevel)

    let targetName = ''
    if (gIdx >= 0 && gIdx < ladderGrades.length - 1) {
      targetName = `Chart ${curChart} · Level ${ladderGrades[gIdx + 1]}`
    } else {
      targetName = `Chart ${curChart + 1} · Level D-`
    }

    const verified = HistoryAggregator.calculateContiguousVolume(
      progressionStore.rawHistory,
      progressionStore.currentChart,
      progressionStore.currentLevel
    )
    const remaining = progressionStore.validationResult?.remainingSessions ?? 1
    const total = verified + remaining
    const pct =
      total > 0 ? Math.min(100, Math.round((verified / total) * 100)) : 0
    const remText =
      remaining === 1 ? '1 more session' : `${remaining} more sessions`

    return {
      targetName,
      remainingText:
        remaining > 0
          ? `Complete ${remText} to advance`
          : 'Eligible to advance!',
      pct,
    }
  })
</script>
