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

  const TICK_INTERVAL_MS = 250

  const props = withDefaults(
    defineProps<{
      durationSeconds: number
      startTimestamp?: number
      isPaused?: boolean
      showProgress?: boolean
      timeScale?: number
    }>(),
    {
      startTimestamp: undefined,
      isPaused: false,
      showProgress: true,
      timeScale: 1,
    }
  )

  const emit = defineEmits<{
    (e: 'started'): void
    (e: 'paused'): void
    (e: 'expired'): void
  }>()

  const elapsedSeconds = ref(0)
  let tickId: ReturnType<typeof setInterval> | null = null
  let anchorNow = 0
  let anchorElapsed = 0
  let expiredEmitted = false

  const duration = computed(() => Math.max(0, props.durationSeconds))
  const scale = computed(() =>
    Number.isFinite(props.timeScale) && props.timeScale > 0
      ? props.timeScale
      : 1
  )
  const remaining = computed(() =>
    Math.max(0, duration.value - elapsedSeconds.value)
  )
  const isExpired = computed(() => remaining.value <= 0)

  const formattedTime = computed(() => {
    const totalSecs = Math.ceil(remaining.value)
    const m = Math.floor(totalSecs / 60)
    const s = totalSecs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  })

  const progressPercent = computed(() =>
    duration.value > 0
      ? Math.min(100, (elapsedSeconds.value / duration.value) * 100)
      : 0
  )

  function clampElapsed(value: number): number {
    return Math.min(duration.value, Math.max(0, value))
  }

  function readElapsedFromAnchor(): number {
    const deltaSeconds = (performance.now() - anchorNow) / 1000
    return clampElapsed(anchorElapsed + deltaSeconds * scale.value)
  }

  function stopTicker() {
    if (tickId) {
      clearInterval(tickId)
      tickId = null
    }
  }

  function startTicker() {
    stopTicker()
    if (props.isPaused || isExpired.value) return

    anchorNow = performance.now()
    anchorElapsed = elapsedSeconds.value
    tickId = setInterval(updateElapsed, TICK_INTERVAL_MS)
  }

  function emitExpiredIfNeeded() {
    if (isExpired.value && !expiredEmitted) {
      expiredEmitted = true
      emit('expired')
    }
  }

  function updateElapsed() {
    if (props.isPaused) return

    elapsedSeconds.value = readElapsedFromAnchor()

    if (isExpired.value) {
      stopTicker()
      emitExpiredIfNeeded()
    }
  }

  function initialElapsed(): number {
    if (props.startTimestamp === undefined) return 0

    const elapsed = (Date.now() - props.startTimestamp) / 1000
    if (!Number.isFinite(elapsed) || elapsed <= 0) return 0
    return clampElapsed(elapsed * scale.value)
  }

  function resetClock() {
    stopTicker()
    expiredEmitted = false
    elapsedSeconds.value = initialElapsed()

    emit('started')

    if (isExpired.value) {
      expiredEmitted = true
      emit('expired')
      return
    }

    if (!props.isPaused) {
      startTicker()
    }
  }

  watch(
    () => [props.durationSeconds, props.startTimestamp],
    () => {
      resetClock()
    }
  )

  watch(
    () => props.isPaused,
    (paused) => {
      if (paused) {
        elapsedSeconds.value = readElapsedFromAnchor()
        stopTicker()
        emitExpiredIfNeeded()
        emit('paused')
        return
      }

      if (!isExpired.value) {
        startTicker()
      }
    }
  )

  onMounted(() => {
    resetClock()
  })

  onUnmounted(() => {
    stopTicker()
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
