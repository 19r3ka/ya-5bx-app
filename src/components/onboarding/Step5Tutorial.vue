<template>
  <div class="fill-height d-flex flex-column pa-6">
    <div class="mb-8 mt-8 w-100 mx-auto max-width-600">
      <h2 class="fc-exercise text-primary mb-2 text-uppercase">
        How to Log a Set
      </h2>
      <p class="fc-body text-on-surface-variant">
        Follow the tutorial below to master the input flow.
      </p>
    </div>

    <div class="flex-grow-1 w-100 mx-auto max-width-600">
      <!-- Interactive Tutorial Card -->
      <v-card color="surface" rounded="lg" class="pa-6 tutorial-card mb-8">
        <v-icon
          size="120"
          class="position-absolute bg-watermark watermark-tutorial"
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
              v-if="!tutorialExpired"
              :duration-seconds="59"
              :time-scale="TUTORIAL_TIME_SCALE"
              @expired="tutorialExpired = true"
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

    <div class="w-100 mx-auto max-width-600">
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
  import { ref } from 'vue'
  import WorkoutTimerClock from '../workout/WorkoutTimerClock.vue'
  import WorkoutRepOverridePanel from '../workout/WorkoutRepOverridePanel.vue'

  const emit = defineEmits<{
    (e: 'next'): void
  }>()

  // Display 59 clock-seconds in about 8 real seconds.
  const TUTORIAL_TIME_SCALE = 59 / 8
  const tutorialExpired = ref(false)
  const isLogged = ref(false)

  function handleLog() {
    isLogged.value = true
  }
</script>
