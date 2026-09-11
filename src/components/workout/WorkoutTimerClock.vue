<template>
  <div class="timer-clock py-4 text-center">
    <p class="fc-timer text-primary">{{ formattedTime }}</p>
    <v-progress-linear
      :model-value="progressPercent"
      color="secondary"
      bg-color="surface-elevated"
      height="8"
      rounded
      class="mt-4"
      :class="{ 'timer-expired': isExpired }"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    elapsedSeconds: number
    totalIntervalSeconds: number
  }>()

  const remaining = computed(() =>
    Math.max(0, props.totalIntervalSeconds - props.elapsedSeconds)
  )
  const isExpired = computed(
    () => props.elapsedSeconds >= props.totalIntervalSeconds
  )
  const formattedTime = computed(() => {
    const m = Math.floor(remaining.value / 60)
    const s = remaining.value % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  })
  const progressPercent = computed(() =>
    props.totalIntervalSeconds > 0
      ? Math.min(100, (props.elapsedSeconds / props.totalIntervalSeconds) * 100)
      : 0
  )
</script>

<style scoped>
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
