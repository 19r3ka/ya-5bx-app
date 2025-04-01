<template>
  <v-card class="pa-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" justify="center" align="center">
          <WorkoutTimerDisplay :timer="timer" :workout="workout" />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-row>
        <v-col cols="12" align="center" justify="center">
          <WorkoutTimerControls
            id="timer-controls"
            :isRunning="isRunning"
            @timer:runOrStop="runOrStopTimer"
            @timer:skip="advanceTimer"
            @timer:reset="resetTimers"
          />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import WorkoutTimerDisplay from '@/components/WorkoutTimerDisplay.vue'
  import WorkoutTimerControls from '@/components/WorkoutTimerControls.vue'
  import { useTimer } from '@/composables/useTimer'

  const {
    isRunning,
    workout,
    timer,
    startTimer,
    stopTimer,
    resetWorkout,
    goToNextTimer,
  } = useTimer()

  // event handlers
  const runOrStopTimer = () => (isRunning.value ? stopTimer() : startTimer())
  const advanceTimer = () => goToNextTimer()
  const resetTimers = () => resetWorkout()
</script>

<style scoped>
  #timer-controls {
    max-width: 400px;
  }
</style>
