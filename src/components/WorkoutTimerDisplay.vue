<template>
  <v-progress-circular
    :rotate="DEFAULT_ROTATION"
    :size="DEFAULT_SIZE"
    :width="DEFAULT_WIDTH"
    :model-value="timerProgress"
    color="primary"
    class="ma-4"
  >
    <div class="text-center">
      <div class="text-h6 grey--text text--lighten-1 mt-2">
        {{ intervalProgress }}
      </div>
      <div class="text-h2 white--text">{{ timer.remainingTime }}</div>
      <div class="text-h6 grey--text text--lighten-1 mt-2">
        {{ interval.totalWorkoutRemainingTime }}
      </div>
    </div>
  </v-progress-circular>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { IntervalWorkout, Timer } from 'types/timer'
  import { formatDisplayTime } from '@/composables/useTimer'

  const DEFAULT_ROTATION = 0
  const DEFAULT_SIZE = 200
  const DEFAULT_WIDTH = 15

  const props = defineProps<{
    timer: Timer
    workout: IntervalWorkout
  }>()

  const timer = computed(() => ({
    remainingTime: formatDisplayTime(props.timer.remainingSeconds),
    index: (props.timer.index || 0) + 1, // proper timer index display should start at 1 and not 0
  }))

  const interval = computed(() => ({
    totalWorkoutRemainingTime: formatDisplayTime(
      props.workout.remainingWorkoutTimeSeconds || props.timer.remainingSeconds
    ),
    timersTotal: props.workout.totalTimers || 1,
  }))

  const timerProgress = computed(
    () => (props.timer.remainingSeconds / props.timer.durationSeconds) * 100
  )

  const intervalProgress = computed(
    () => `${timer.value.index}/${interval.value.timersTotal}`
  )
</script>
