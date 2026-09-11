<template>
  <div class="fill-height d-flex flex-column pa-6">
    <div class="mb-8 mt-8 w-100 mx-auto" style="max-width: 600px">
      <h2 class="fc-exercise text-primary mb-2 text-uppercase">
        How to Log a Set
      </h2>
      <p class="fc-body text-on-surface-variant">
        Follow the tutorial below to master the input flow.
      </p>
    </div>

    <div class="flex-grow-1 w-100 mx-auto" style="max-width: 600px">
      <!-- Interactive Tutorial Card -->
      <v-card color="surface" rounded="lg" class="pa-6 tutorial-card mb-8">
        <v-icon size="120" class="position-absolute bg-watermark"
          >mdi-run</v-icon
        >

        <div class="d-flex justify-space-between align-start mb-6">
          <div>
            <h3 class="fc-exercise text-on-surface text-uppercase">Push-Ups</h3>
            <p
              class="fc-caption text-secondary text-uppercase font-weight-bold tracking-wide"
            >
              Target: 15 REPS
            </p>
          </div>
        </div>

        <v-expand-transition mode="out-in">
          <div v-if="!isLogged">
            <!-- Render Timer OR Rest Panel -->
            <WorkoutTimerClock
              v-if="tutorialElapsed < 59"
              :elapsed-seconds="tutorialElapsed"
              :total-interval-seconds="59"
            />
            <div v-else>
              <WorkoutRepOverridePanel
                :default-reps="15"
                exercise-name="Push-Ups"
                @logged="handleLog"
              />
              <div
                class="d-flex align-start ga-3 pa-4 mt-6 rounded-lg tutorial-info"
              >
                <v-icon color="secondary">mdi-information</v-icon>
                <p class="fc-caption text-on-surface mb-0">
                  Tap <b>-</b> or <b>+</b> to adjust your actual performance,
                  then tap the checkmark to log the set.
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <div
              class="d-flex align-center justify-center ga-2 text-success mb-4"
            >
              <v-icon>mdi-check-circle</v-icon>
              <span class="fc-body-strong">Set logged successfully!</span>
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <div class="w-100 mx-auto" style="max-width: 600px">
      <v-expand-transition>
        <v-btn
          v-if="isLogged"
          color="primary-container"
          block
          size="x-large"
          rounded="md"
          append-icon="mdi-chevron-right"
          @click="emit('next')"
        >
          <span class="fc-section">Complete Tutorial</span>
        </v-btn>
      </v-expand-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import WorkoutTimerClock from '../workout/WorkoutTimerClock.vue'
  import WorkoutRepOverridePanel from '../workout/WorkoutRepOverridePanel.vue'

  const emit = defineEmits<{
    (e: 'next'): void
  }>()

  const tutorialElapsed = ref(0)
  const isLogged = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    intervalId = setInterval(() => {
      if (tutorialElapsed.value < 59) tutorialElapsed.value++
    }, 130) // 59 steps × 130ms ≈ 7.7s real time
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  function handleLog() {
    isLogged.value = true
    if (intervalId) clearInterval(intervalId)
  }
</script>

<style scoped>
  .tutorial-card {
    border-left: 4px solid rgb(var(--v-theme-primary));
    position: relative;
    overflow: hidden;
  }
  .bg-watermark {
    right: -20px;
    top: -20px;
    opacity: 0.05;
  }
  .tracking-wide {
    letter-spacing: 1px;
  }
  .tutorial-info {
    background: rgba(var(--v-theme-secondary), 0.1);
    border: 1px solid rgba(var(--v-theme-secondary), 0.2);
  }
</style>
