<template>
  <v-container class="pa-0 fill-height flex-column bg-surface-dim" fluid>
    <!-- Top Bar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min header-bar"
    >
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-weight-lifter</v-icon>
        <span class="fc-section text-primary">YA-5BX</span>
      </div>
      <!-- Progress Dots -->
      <div class="d-flex ga-2 align-center">
        <div class="rounded-circle bg-secondary dot"></div>
        <div class="rounded-circle bg-secondary dot"></div>
        <div class="rounded-circle bg-primary timer-expired dot"></div>
        <div class="rounded-circle bg-surface-variant dot"></div>
        <div class="rounded-circle bg-surface-variant dot"></div>
      </div>
      <v-btn
        icon="mdi-pause-circle-outline"
        variant="text"
        color="primary"
      ></v-btn>
    </header>

    <main
      class="flex-grow-1 w-100 px-6 py-8 d-flex flex-column mx-auto position-relative main-container"
    >
      <!-- Distance UI: Timer Section -->
      <section
        class="d-flex flex-column align-center justify-center mb-10 text-center"
      >
        <div class="d-inline-block pa-6 rounded-lg mb-4 timer-pulse bg-surface">
          <WorkoutTimerClock
            :elapsed-seconds="elapsedSeconds"
            :total-interval-seconds="120"
          />
        </div>
        <h2 class="fc-exercise text-on-surface text-uppercase mb-2">
          {{ currentInterval?.displayName ?? 'STRETCHING' }}
        </h2>
        <p
          class="fc-caption text-on-surface-variant text-uppercase tracking-wider"
        >
          Circuit 1 of 5 • Set 1
        </p>
      </section>

      <!-- Dynamic Visualization (Rest Phase Only) -->
      <div class="mb-8">
        <WorkoutRepOverridePanel
          v-if="currentInterval?.isRest"
          :default-reps="previousInterval?.targetReps ?? 15"
          :exercise-name="previousInterval?.displayName ?? 'Push-Ups'"
          @logged="onLogged"
        />
      </div>

      <!-- Call to Action -->
      <div class="mt-auto pt-6 d-flex flex-column ga-6">
        <!-- Next Exercise Hint Card -->
        <v-card
          color="surface"
          class="pa-4 d-flex align-center ga-4 border-accent opacity-80 transition-opacity"
        >
          <v-icon size="48" color="surface-variant">mdi-run</v-icon>
          <div class="flex-grow-1">
            <span class="fc-caption text-on-surface-variant text-uppercase"
              >Up Next</span
            >
            <h3 class="fc-body-strong text-on-surface text-uppercase">
              Sit-Ups
            </h3>
          </div>
          <v-icon color="on-surface-variant">mdi-chevron-right</v-icon>
        </v-card>
      </div>
    </main>

    <v-dialog
      v-model="showPostWorkout"
      persistent
      max-width="420"
      content-class="align-end justify-center dialog-wrapper"
    >
      <PostWorkoutDialog @saved="onSessionSaved" />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import WorkoutTimerClock from '@/components/workout/WorkoutTimerClock.vue'
  import WorkoutRepOverridePanel from '@/components/workout/WorkoutRepOverridePanel.vue'
  import PostWorkoutDialog from '@/components/workout/PostWorkoutDialog.vue'

  interface IntervalInfo {
    displayName: string
    targetReps?: number
    isRest?: boolean
  }

  const router = useRouter()
  const showPostWorkout = ref(false)
  const elapsedSeconds = ref(0)

  const currentInterval = ref<IntervalInfo | null>({
    displayName: 'STRETCHING',
    isRest: false,
  })

  const previousInterval = ref<IntervalInfo | null>({
    displayName: 'Push-Ups',
    targetReps: 15,
  })

  function onLogged() {
    showPostWorkout.value = true
  }

  function onSessionSaved() {
    showPostWorkout.value = false
    if (router) {
      router.push({ name: 'dashboard' })
    }
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
