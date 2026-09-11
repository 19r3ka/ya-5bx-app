<template>
  <v-card color="surface-elevated" rounded="lg" class="pa-6">
    <div v-if="exerciseName" class="text-center mb-4">
      <span
        class="fc-caption text-on-surface-variant text-uppercase font-weight-bold"
        >{{ exerciseName }}</span
      >
    </div>
    <div class="d-flex justify-space-between align-center px-4">
      <v-btn
        variant="tonal"
        color="primary"
        icon
        class="stepper-btn"
        @click="reps = Math.max(0, reps - 1)"
      >
        <v-icon size="32">mdi-minus</v-icon>
      </v-btn>
      <div class="text-center">
        <div class="fc-rep-target text-primary">{{ reps }}</div>
        <div class="fc-caption text-uppercase">Reps</div>
      </div>
      <v-btn
        variant="tonal"
        color="primary"
        icon
        class="stepper-btn"
        @click="reps++"
      >
        <v-icon size="32">mdi-plus</v-icon>
      </v-btn>
    </div>
    <v-btn
      color="primary-container"
      block
      size="x-large"
      class="mt-6"
      rounded="md"
      @click="emit('logged', reps)"
    >
      <span class="fc-section">Log Set</span>
      <v-icon end>mdi-check</v-icon>
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{
    defaultReps: number
    exerciseName: string
  }>()

  const reps = ref(props.defaultReps)

  watch(
    () => props.defaultReps,
    (val) => {
      reps.value = val
    }
  )

  const emit = defineEmits<{
    (e: 'logged', reps: number): void
  }>()
</script>

<style scoped>
  .stepper-btn {
    width: 64px;
    height: 64px;
  }
</style>
