<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card color="surface-elevated" rounded="xl" class="pa-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex align-center ga-2">
          <v-icon color="primary" size="28">mdi-information-outline</v-icon>
          <h3 class="fc-section text-primary text-uppercase mb-0">
            ABOUT YA-5BX
          </h3>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="emit('update:modelValue', false)"
        ></v-btn>
      </div>

      <div class="mb-4">
        <p class="fc-body-strong text-on-surface mb-2">
          The 11-Minute Physical Fitness Plan
        </p>
        <p class="fc-body text-on-surface-variant mb-3">
          YA-5BX is based on the famous Royal Canadian Air Force 5 Basic
          Exercises (5BX) system designed to achieve and maintain optimal
          fitness in just 11 minutes a day, requiring no specialized equipment.
        </p>
        <p class="fc-body text-on-surface-variant mb-0">
          The workout consists of 5 consecutive exercises:
        </p>
        <ul class="text-on-surface-variant pl-4 mt-2 fc-caption">
          <li>
            <strong>01 Stretching</strong>: Forward & upward spinal mobility (2
            min)
          </li>
          <li>
            <strong>02 Sit-Ups</strong>: Core abdominal conditioning (1 min)
          </li>
          <li>
            <strong>03 Back Extensions</strong>: Posterior chain endurance (1
            min)
          </li>
          <li>
            <strong>04 Push-Ups</strong>: Upper-body pushing power (1 min)
          </li>
          <li>
            <strong>05 Aerobic / Run</strong>: Cardiovascular output (6 min)
          </li>
        </ul>
      </div>

      <v-card color="surface" rounded="lg" class="pa-3 mb-6 border-accent">
        <div class="d-flex align-center ga-2 text-secondary mb-1">
          <v-icon size="small">mdi-shield-check-outline</v-icon>
          <span class="fc-caption font-weight-bold text-uppercase"
            >Progression Rule</span
          >
        </div>
        <p class="fc-caption text-on-surface-variant mb-0">
          Gradually advance through charts and levels. Do not skip levels, and
          hold at your current level if you experience soreness or stiff
          muscles.
        </p>
      </v-card>

      <v-btn
        color="primary"
        block
        size="large"
        rounded="md"
        @click="emit('update:modelValue', false)"
      >
        Understood
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void
  }>()
</script>

<style scoped>
  .border-accent {
    border: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
  }
</style>
