<template>
  <v-container class="pa-0 fill-height flex-column bg-background" fluid>
    <!-- Top Bar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min header-bar"
    >
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-weight-lifter</v-icon>
        <span class="fc-section text-primary">YA-5BX SESSION</span>
      </div>
      <!-- Progress Dots -->
      <div class="d-flex ga-2 align-center">
        <div
          v-for="i in totalIntervals"
          :key="i"
          class="rounded-circle dot"
          :class="getDotClass(i - 1)"
        ></div>
      </div>
      <v-btn
        :icon="
          isPaused ? 'mdi-play-circle-outline' : 'mdi-pause-circle-outline'
        "
        variant="text"
        color="primary"
        aria-label="Pause or Resume Workout"
        @click="togglePause"
      ></v-btn>
    </header>

    <main
      class="flex-grow-1 w-100 px-6 py-8 d-flex flex-column mx-auto position-relative main-container"
    >
      <v-alert
        v-if="showSealFailedBanner"
        type="error"
        density="compact"
        class="mb-4"
        closable
      >
        Session completed, but saving telemetry failed. Check connection or
        reload.
      </v-alert>

      <!-- Distance UI: Timer Section -->
      <section
        class="d-flex flex-column align-center justify-center mb-10 text-center"
      >
        <div class="d-inline-block pa-6 rounded-lg mb-4 timer-pulse bg-surface">
          <WorkoutTimerClock
            :duration-seconds="currentInterval?.durationSeconds ?? 60"
            :elapsed-seconds="elapsedSeconds"
            :is-paused="isPaused"
            @expired="onTimerExpired"
          />
        </div>
        <h2 class="fc-exercise text-on-surface text-uppercase mb-2">
          {{ currentInterval?.displayName ?? 'STRETCHING' }}
        </h2>
        <p
          class="fc-caption text-on-surface-variant text-uppercase tracking-wider"
        >
          Exercise {{ currentIntervalIndex + 1 }} of {{ totalIntervals }}
        </p>
      </section>

      <!-- Dynamic Visualization (Rep-based exercises only) -->
      <div class="mb-8">
        <WorkoutRepOverridePanel
          v-if="isRepPhase"
          :default-reps="currentInterval?.targetReps ?? 0"
          :exercise-name="currentInterval?.displayName ?? ''"
          @logged="onLogged"
        />
      </div>

      <!-- Call to Action -->
      <div class="mt-auto pt-6 d-flex flex-column ga-6">
        <!-- Next Exercise Hint Card -->
        <v-card
          v-if="nextInterval"
          color="surface"
          class="pa-4 d-flex align-center ga-4 border-accent opacity-80 transition-opacity"
        >
          <v-icon size="48" color="surface-variant">mdi-run</v-icon>
          <div class="flex-grow-1">
            <span class="fc-caption text-on-surface-variant text-uppercase"
              >Up Next</span
            >
            <h3 class="fc-body-strong text-on-surface text-uppercase">
              {{ nextInterval.displayName }}
            </h3>
          </div>
          <v-icon color="on-surface-variant">mdi-chevron-right</v-icon>
        </v-card>
      </div>
    </main>

    <!-- Paused Overlay Modal -->
    <v-overlay
      v-model="isPaused"
      class="align-center justify-center text-center"
      scrim="rgba(17,19,25,0.85)"
      persistent
    >
      <v-card
        color="surface-elevated"
        rounded="lg"
        class="pa-8 text-center"
        width="340"
      >
        <div class="d-flex align-center justify-center ga-2 text-primary mb-2">
          <v-icon size="32">mdi-pause-circle</v-icon>
          <h2 class="fc-section text-primary text-uppercase mb-0">PAUSED</h2>
        </div>
        <p class="fc-body-strong text-on-surface text-uppercase mb-1">
          {{ currentInterval?.displayName ?? 'Workout' }}
        </p>
        <p class="fc-caption text-content-secondary mb-6">
          {{ remainingLabel }} remaining
        </p>

        <div class="d-flex flex-column ga-3">
          <v-btn
            color="primary-container"
            block
            size="x-large"
            rounded="lg"
            class="text-on-primary-container"
            @click="resumeWorkout"
          >
            <v-icon start>mdi-play</v-icon>
            Resume
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            block
            size="large"
            rounded="lg"
            @click="handleRestart"
          >
            <v-icon start>mdi-restart</v-icon>
            Restart workout
          </v-btn>
          <v-btn
            variant="text"
            color="error"
            block
            size="large"
            rounded="lg"
            @click="showAbandonConfirm = true"
          >
            <v-icon start>mdi-close-circle-outline</v-icon>
            Abandon workout
          </v-btn>
        </div>
      </v-card>
    </v-overlay>

    <!-- Abandon Confirmation Bottom Sheet -->
    <v-bottom-sheet v-model="showAbandonConfirm" persistent>
      <v-card color="surface" rounded="t-xl" class="pa-6">
        <div class="d-flex align-center ga-3 mb-3 text-error">
          <v-icon size="28">mdi-alert-circle-outline</v-icon>
          <h3 class="fc-body-strong mb-0 text-on-surface">
            Abandon this session?
          </h3>
        </div>
        <p class="fc-caption text-content-secondary mb-6">
          This session will end now and will not count toward your level
          progression.
        </p>
        <div class="d-flex ga-3">
          <v-btn
            variant="text"
            color="on-surface"
            class="flex-grow-1"
            @click="showAbandonConfirm = false"
          >
            Keep going
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            class="flex-grow-1"
            @click="confirmAbandon"
          >
            Yes, abandon
          </v-btn>
        </div>
      </v-card>
    </v-bottom-sheet>

    <v-dialog
      v-model="showPostWorkout"
      persistent
      max-width="420"
      content-class="align-end justify-center dialog-wrapper"
    >
      <PostWorkoutDialog
        :session-token="currentSessionToken"
        @saved="onSessionSaved"
        @seal-failed="onSealFailed"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import WorkoutTimerClock from '@/components/workout/WorkoutTimerClock.vue'
  import WorkoutRepOverridePanel from '@/components/workout/WorkoutRepOverridePanel.vue'
  import PostWorkoutDialog from '@/components/workout/PostWorkoutDialog.vue'
  import { useWorkoutEngine } from '@/composables/useWorkoutEngine'
  import { useProgressionStore } from '@/stores/useProgressionStore'

  const router = useRouter()
  const progressionStore = useProgressionStore()
  const {
    snapshot,
    elapsedSeconds,
    pauseWorkout,
    resumeWorkout,
    restartWorkout,
    abandonCurrentSessionAsync,
  } = useWorkoutEngine()

  const showPostWorkout = ref(false)
  const showAbandonConfirm = ref(false)
  const showSealFailedBanner = ref(false)

  const isPaused = computed({
    get: () => snapshot.value?.status === 'PAUSED',
    set: (value: boolean) => {
      if (!value && snapshot.value?.status === 'PAUSED') {
        resumeWorkout()
      }
    },
  })

  const currentInterval = computed(() => {
    const s = snapshot.value
    if (
      !s ||
      s.currentIntervalIndex < 0 ||
      s.currentIntervalIndex >= s.intervals.length
    ) {
      return null
    }
    return s.intervals[s.currentIntervalIndex]
  })

  const nextInterval = computed(() => {
    const s = snapshot.value
    if (!s || s.currentIntervalIndex + 1 >= s.intervals.length) {
      return null
    }
    return s.intervals[s.currentIntervalIndex + 1]
  })

  const currentSessionToken = computed(() => snapshot.value?.sessionToken ?? '')
  const currentIntervalIndex = computed(
    () => snapshot.value?.currentIntervalIndex ?? 0
  )
  const totalIntervals = computed(() => snapshot.value?.intervals?.length ?? 5)

  // Rep-based intervals (those carrying a target rep count) surface the rep
  // logging panel. The aerobic run/walk block has no targetReps, so it stays
  // a zero-touch timer phase (rules.md §3 Floor Ergonomics Rule).
  const isRepPhase = computed(
    () => (currentInterval.value?.targetReps ?? 0) > 0
  )

  const remainingLabel = computed(() => {
    const duration = currentInterval.value?.durationSeconds ?? 60
    const rem = Math.max(0, duration - elapsedSeconds.value)
    const m = Math.floor(rem / 60)
    const s = rem % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  })

  watch(
    () => snapshot.value?.status,
    async (status) => {
      if (status === 'COMPLETED') {
        try {
          await progressionStore.telemetryService.stagePendingSessionAsync({
            version: 1,
            sessionToken: currentSessionToken.value,
            completedAt: Date.now(),
            chartNumber: progressionStore.currentChart,
            levelString: progressionStore.currentLevel,
            durationSeconds: snapshot.value?.totalElapsedSeconds || 660,
          })
        } catch (err) {
          console.error('Failed to stage pending session:', err)
        }
        showPostWorkout.value = true
      }
    }
  )

  function getDotClass(idx: number) {
    if (idx < currentIntervalIndex.value) return 'bg-secondary'
    if (idx === currentIntervalIndex.value) return 'bg-primary timer-expired'
    return 'bg-surface-variant'
  }

  function togglePause() {
    if (isPaused.value) {
      resumeWorkout()
    } else {
      pauseWorkout()
    }
  }

  function handleRestart() {
    restartWorkout()
  }

  async function confirmAbandon() {
    showAbandonConfirm.value = false
    await abandonCurrentSessionAsync()
    if (router) {
      router.push({ name: 'dashboard' })
    }
  }

  function onTimerExpired() {
    // Engine automatically advances on timer completion
  }

  function onLogged() {
    // Reps logged
  }

  async function onSessionSaved() {
    showPostWorkout.value = false
    await progressionStore.reloadHistoryAsync()
    if (router) {
      router.push({ name: 'dashboard' })
    }
  }

  function onSealFailed() {
    showPostWorkout.value = false
    showSealFailedBanner.value = true
  }
</script>

<style scoped>
  .header-bar {
    z-index: 50;
  }
  .dot {
    width: 8px;
    height: 8px;
  }
  .main-container {
    max-width: 600px;
  }
  .tracking-wider {
    letter-spacing: 2px;
  }
  .border-accent {
    border: 1px solid rgba(var(--v-theme-outline-variant), 0.3);
  }
  .dialog-wrapper {
    margin-bottom: 24px;
  }
  @keyframes border-pulse {
    0% {
      border-color: rgba(var(--v-theme-primary), 0.2);
    }
    50% {
      border-color: rgba(var(--v-theme-primary), 1);
    }
    100% {
      border-color: rgba(var(--v-theme-primary), 0.2);
    }
  }
  .timer-pulse {
    border: 2px solid rgba(var(--v-theme-primary), 0.2);
    animation: border-pulse 2s infinite;
  }
  .timer-expired {
    animation: pulse-amber 1s ease-in-out infinite;
  }
  @keyframes pulse-amber {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
</style>
