<template>
  <div class="timer-clock py-4 text-center">
    <p class="fc-timer text-primary font-timer-display tabular-nums mb-0">
      {{ formattedTime }}
    </p>
    <v-progress-linear
      v-if="showProgress"
      :model-value="progressPercent"
      color="secondary"
      bg-color="surface-elevated"
      height="8"
      rounded
      class="mt-4"
      :class="{ 'timer-expired': isExpired, 'timer-paused': isPaused }"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

  const props = withDefaults(
    defineProps<{
      durationSeconds: number
      elapsedSeconds?: number
      startTimestamp?: number
      isPaused?: boolean
      showProgress?: boolean
    }>(),
    {
      elapsedSeconds: undefined,
      startTimestamp: undefined,
      isPaused: false,
      showProgress: true,
    }
  )

  const emit = defineEmits<{
    (e: 'expired'): void
  }>()

  // Local fallback elapsed for when elapsedSeconds is not explicitly passed
  const localElapsed = ref(0)
  let timerId: ReturnType<typeof setInterval> | null = null

  const effectiveElapsed = computed(() => {
    if (props.elapsedSeconds !== undefined) {
      return props.elapsedSeconds
    }
    return localElapsed.value
  })

  const remaining = computed(() =>
    Math.max(0, props.durationSeconds - effectiveElapsed.value)
  )

  const isExpired = computed(() => remaining.value <= 0)

  const formattedTime = computed(() => {
    const totalSecs = remaining.value
    const m = Math.floor(totalSecs / 60)
    const s = totalSecs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  })

  const progressPercent = computed(() =>
    props.durationSeconds > 0
      ? Math.min(
          100,
          ((props.durationSeconds - remaining.value) / props.durationSeconds) *
            100
        )
      : 0
  )

  function startInternalTicker() {
    stopInternalTicker()
    if (props.elapsedSeconds !== undefined) return

    timerId = setInterval(() => {
      if (!props.isPaused && remaining.value > 0) {
        localElapsed.value++
        if (localElapsed.value >= props.durationSeconds) {
          stopInternalTicker()
          emit('expired')
        }
      }
    }, 1000)
  }

  function stopInternalTicker() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  watch(
    () => [props.durationSeconds, props.startTimestamp],
    () => {
      localElapsed.value = 0
      startInternalTicker()
    }
  )

  watch(
    () => remaining.value,
    (rem) => {
      if (rem <= 0) {
        emit('expired')
      }
    }
  )

  onMounted(() => {
    startInternalTicker()
  })

  onUnmounted(() => {
    stopInternalTicker()
  })
</script>

<style scoped>
  .font-timer-display {
    letter-spacing: -1px;
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
  .timer-expired {
    animation: pulse-amber 1s ease-in-out infinite;
  }
  .timer-paused {
    opacity: 0.6;
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
