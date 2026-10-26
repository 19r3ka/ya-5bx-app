<template>
  <v-card
    color="surface"
    rounded="lg"
    class="pa-6 d-flex flex-column rep-counter-card"
    :aria-label="ariaLabel"
  >
    <span class="fc-section text-content-secondary text-uppercase">
      Reps Performed
    </span>

    <div class="d-flex align-center justify-center ga-12 py-4">
      <v-btn
        variant="tonal"
        color="on-surface-variant"
        icon
        rounded="lg"
        class="stepper-btn"
        :disabled="disabled || reps <= 0"
        aria-label="Decrease reps"
        @click="decrementReps"
      >
        <v-icon size="32">mdi-minus</v-icon>
      </v-btn>

      <div class="d-flex flex-column align-center">
        <span :key="reps" class="fc-rep-target text-on-surface rep-number">
          {{ reps }}
        </span>
        <span class="fc-caption text-uppercase">Current</span>
      </div>

      <v-btn
        variant="tonal"
        color="primary"
        icon
        rounded="lg"
        class="stepper-btn"
        :disabled="disabled"
        aria-label="Increase reps"
        @click="incrementReps"
      >
        <v-icon size="32">mdi-plus</v-icon>
      </v-btn>
    </div>

    <v-btn
      :color="hasLogged ? 'secondary' : 'primary-container'"
      :variant="hasLogged ? 'tonal' : 'flat'"
      block
      size="x-large"
      rounded="md"
      class="mt-2"
      :class="{ 'text-on-primary-container': !hasLogged }"
      :prepend-icon="hasLogged ? 'mdi-check-circle' : 'mdi-check'"
      :disabled="disabled"
      @click="logReps"
    >
      <span class="fc-body-strong text-uppercase">{{ actionLabel }}</span>
    </v-btn>

    <p
      v-if="disabled"
      class="fc-caption text-content-tertiary text-center mt-3 mb-0"
    >
      Logging unlocks when this set's timer ends.
    </p>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  const props = withDefaults(
    defineProps<{
      defaultReps: number
      exerciseName?: string
      disabled?: boolean
    }>(),
    { exerciseName: '', disabled: false }
  )

  const emit = defineEmits<{
    (e: 'logged', reps: number): void
  }>()

  const reps = ref(Math.max(0, props.defaultReps))
  const loggedReps = ref<number | null>(null)

  const hasLogged = computed(() => loggedReps.value !== null)

  const ariaLabel = computed(() =>
    props.exerciseName
      ? `${props.exerciseName} rep counter`
      : 'Reps performed counter'
  )

  const actionLabel = computed(() => {
    if (loggedReps.value === null) {
      return `Log ${reps.value} reps`
    }
    if (loggedReps.value === reps.value) {
      return `Logged: ${reps.value} reps`
    }
    return `Update to ${reps.value} reps`
  })

  watch(
    () => props.defaultReps,
    (val) => {
      reps.value = Math.max(0, val)
      loggedReps.value = null
    }
  )

  function incrementReps(): void {
    reps.value++
  }

  function decrementReps(): void {
    if (reps.value > 0) {
      reps.value--
    }
  }

  function logReps(): void {
    loggedReps.value = reps.value
    emit('logged', reps.value)
  }
</script>
