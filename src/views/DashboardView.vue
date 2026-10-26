<template>
  <v-container class="pa-0 fill-height flex-column bg-background" fluid>
    <!-- Top Bar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min position-sticky top-0 z-50"
    >
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-weight-lifter</v-icon>
        <span class="fc-section text-primary">YA-5BX</span>
      </div>
      <v-btn
        icon="mdi-help-circle-outline"
        variant="text"
        color="on-surface-variant"
        @click="showHelp = true"
      ></v-btn>
    </header>

    <main class="flex-grow-1 w-100 px-6 pb-32 pt-8 mx-auto max-width-600">
      <v-skeleton-loader
        v-if="!progressionStore.isHydrated"
        type="card, article"
        color="surface"
        class="mb-6"
      />
      <template v-else>
        <!-- Greeting Section -->
        <section class="mb-6">
          <p
            class="fc-caption text-content-secondary text-uppercase mb-1 tracking-wider"
          >
            Dashboard
          </p>
          <h2 class="fc-exercise text-on-surface">
            Good morning, {{ greetingName }}
          </h2>
        </section>

        <!-- Today's Workout Card -->
        <v-card
          color="surface"
          rounded="lg"
          class="mb-6 position-relative overflow-hidden workout-card"
        >
          <div class="position-absolute bg-watermark watermark-dashboard">
            <v-icon size="180">mdi-run</v-icon>
          </div>

          <div class="pa-6 d-flex flex-column h-100">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <h3 class="fc-section text-primary mb-1">TODAY'S WORKOUT</h3>
                <p class="fc-body-strong text-on-surface font-size-20">
                  Chart {{ progressionStore.currentChart }} · Level
                  {{ progressionStore.currentLevel }}
                </p>
              </div>
              <div
                class="bg-surface-elevated px-3 py-1 rounded-lg border-surface-variant d-flex align-center"
              >
                <span class="fc-timer text-primary timer-text">11:00</span>
                <span class="fc-caption text-content-secondary ml-1">EST.</span>
              </div>
            </div>

            <div class="mt-8 mb-6">
              <div class="d-flex justify-space-between align-end mb-2">
                <span class="fc-caption text-content-secondary"
                  >LEVEL PROGRESS</span
                >
                <span class="fc-body-strong text-secondary">{{
                  completedSessionsText
                }}</span>
              </div>
              <v-progress-linear
                :model-value="sessionProgressPct"
                color="secondary"
                bg-color="surface-variant"
                height="12"
                rounded
              />
            </div>

            <v-btn
              color="primary-container"
              block
              size="x-large"
              rounded="lg"
              class="text-on-primary-container mt-auto"
              @click="startWorkout"
            >
              <span class="fc-section font-size-20">START WORKOUT</span>
              <v-icon end>mdi-play</v-icon>
            </v-btn>
          </div>
        </v-card>

        <!-- Stats Grid -->
        <v-row class="mb-6">
          <v-col cols="6">
            <v-card
              rounded="lg"
              class="pa-5 h-100 d-flex flex-column justify-space-between streak-card"
            >
              <div class="d-flex justify-space-between mb-4">
                <v-icon color="secondary">mdi-lightning-bolt</v-icon>
                <span class="fc-caption text-secondary">STREAK</span>
              </div>
              <div>
                <p class="fc-rep-target text-on-surface line-height-1">
                  {{ streakDays }}
                </p>
                <p class="fc-body text-on-surface-variant mt-1">Days Active</p>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              color="surface-elevated"
              rounded="lg"
              class="pa-5 h-100 d-flex flex-column justify-space-between border-surface-variant"
            >
              <div class="d-flex justify-space-between mb-4">
                <v-icon color="primary">mdi-medal</v-icon>
                <span class="fc-caption text-content-secondary">LEVEL</span>
              </div>
              <div>
                <p class="fc-rep-target text-primary line-height-1">
                  {{ progressionStore.currentLevel }}
                </p>
                <p class="fc-body text-content-secondary mt-1">
                  Advance in {{ advanceDaysText }}
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Last Session Summary -->
        <section class="mb-6">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center ga-4 flex-grow-1">
              <h3 class="fc-section text-content-secondary text-uppercase mb-0">
                Last Session Summary
              </h3>
              <v-divider></v-divider>
            </div>
          </div>
          <p class="fc-caption text-content-tertiary mb-3">
            {{ lastSessionSubtitle }}
          </p>
          <v-row dense>
            <v-col v-for="(ex, i) in lastSession" :key="i" cols="6">
              <v-card
                color="surface"
                class="pa-4 border-surface-variant rounded-lg"
              >
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small" color="secondary"
                    >mdi-check-circle</v-icon
                  >
                  <p
                    class="fc-caption text-content-secondary text-uppercase mb-0"
                  >
                    {{ ex.name }}
                  </p>
                </div>
                <p class="fc-body-strong font-size-18 mb-0">{{ ex.val }}</p>
              </v-card>
            </v-col>
          </v-row>
        </section>

        <!-- Pro Tip Card -->
        <v-card
          color="surface-elevated"
          rounded="lg"
          class="pa-6 border-surface-variant position-relative overflow-hidden tip-card"
        >
          <div class="d-flex align-center ga-2 text-primary mb-2">
            <v-icon size="small">mdi-lightbulb-on</v-icon>
            <h4 class="fc-section text-primary text-uppercase mb-0">PRO TIP</h4>
          </div>
          <p class="fc-body text-content-secondary font-italic mb-0">
            "Consistency in the 5BX program is the key to cardiovascular
            durability. Don't skip the warm-up stretches today."
          </p>
        </v-card>
      </template>
    </main>

    <AppHelpDialog v-model="showHelp" />
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import AppHelpDialog from '@/components/common/AppHelpDialog.vue'
  import { useUserStore } from '@/stores/useUserStore'
  import { useProgressionStore } from '@/stores/useProgressionStore'
  import { HistoryAggregator } from '@/core/storage/HistoryAggregator'
  import chartsMatrixJson from '@/core/data/charts_matrix.json'

  interface ChartLevelData {
    exercise_1_reps: number
    exercise_2_reps: number
    exercise_3_reps: number
    exercise_4_reps: number
    exercise_5_stationary_steps: number
    outdoor_run_target_minutes: number
    walk_target_minutes: number
  }
  type ChartsMatrix = Record<string, Record<string, ChartLevelData>>
  const chartsMatrix = chartsMatrixJson as unknown as ChartsMatrix

  const router = useRouter()
  const userStore = useUserStore()
  const progressionStore = useProgressionStore()
  const showHelp = ref(false)

  const greetingName = computed(() => userStore.profile?.name ?? 'Recruit')

  const verifiedSessionsCount = computed(() => {
    if (!progressionStore.isHydrated) return 0
    return HistoryAggregator.calculateContiguousVolume(
      progressionStore.rawHistory,
      progressionStore.currentChart,
      progressionStore.currentLevel
    )
  })

  const sessionsRemaining = computed(
    () => progressionStore.validationResult?.remainingSessions ?? 0
  )

  const completedSessionsText = computed(() => {
    const total = verifiedSessionsCount.value + sessionsRemaining.value
    return total > 0
      ? `${verifiedSessionsCount.value} of ${total} Sessions`
      : `${verifiedSessionsCount.value} Sessions`
  })

  const advanceDaysText = computed(() => {
    const rem = sessionsRemaining.value
    return rem === 1 ? '1 session' : `${rem} sessions`
  })

  const sessionProgressPct = computed(() => {
    const total = verifiedSessionsCount.value + sessionsRemaining.value
    if (total === 0) return 0
    return Math.min(
      100,
      Math.round((verifiedSessionsCount.value / total) * 100)
    )
  })

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

  const lastCompletedSessionRecord = computed(() => {
    const verified = progressionStore.rawHistory.filter(
      (s) => s.telemetryStatus !== 'PENDING_TELEMETRY'
    )
    if (verified.length === 0) return null
    return verified[verified.length - 1]
  })

  const lastSessionSubtitle = computed(() => {
    if (lastCompletedSessionRecord.value) {
      const date = new Date(lastCompletedSessionRecord.value.completedAt)
      return `Recorded for Chart ${lastCompletedSessionRecord.value.chartNumber} · Level ${lastCompletedSessionRecord.value.levelString} (${date.toLocaleDateString()})`
    }
    return `Upcoming targets for Chart ${progressionStore.currentChart} · Level ${progressionStore.currentLevel}`
  })

  const lastSession = computed(() => {
    const record = lastCompletedSessionRecord.value
    const chart = record ? record.chartNumber : progressionStore.currentChart
    const level = record ? record.levelString : progressionStore.currentLevel
    const data = chartsMatrix[chart.toString()]?.[level]

    if (!data) {
      return [
        { name: 'Push-ups', val: '10 Reps' },
        { name: 'Sit-ups', val: '12 Reps' },
        { name: 'Flexibility', val: '2:00 Min' },
        { name: 'Running', val: '6:00 Min' },
      ]
    }

    return [
      { name: 'Push-ups', val: `${data.exercise_4_reps} Reps` },
      { name: 'Sit-ups', val: `${data.exercise_2_reps} Reps` },
      { name: 'Flexibility', val: '2:00 Min' },
      { name: 'Running', val: '6:00 Min' },
    ]
  })

  function startWorkout() {
    if (router) {
      router.push({ name: 'workout-setup' })
    }
  }
</script>
