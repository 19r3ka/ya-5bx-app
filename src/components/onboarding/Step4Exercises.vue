<template>
  <div class="fill-height d-flex flex-column justify-space-between pa-6">
    <div class="flex-grow-1 w-100 mx-auto" style="max-width: 600px">
      <h2 class="fc-exercise text-primary text-uppercase mb-2">
        CHOOSE YOUR DRILLS
      </h2>
      <p class="fc-body text-on-surface-variant mb-6">
        Customize your daily 5-set circuit. Each exercise is designed for
        maximum functional efficiency.
      </p>

      <v-expansion-panels
        v-model="expandedPanel"
        variant="accordion"
        bg-color="surface-elevated"
        rounded="lg"
      >
        <v-expansion-panel v-for="(exercise, index) in exercises" :key="index">
          <v-expansion-panel-title class="h-touch-target-min">
            <div class="d-flex align-center ga-4 w-100">
              <span
                class="fc-timer text-primary"
                style="font-size: 24px; line-height: 24px; width: 32px"
                >0{{ index + 1 }}</span
              >
              <span class="fc-body-strong text-on-surface">{{
                exercise.name
              }}</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="pt-2 border-top-accent">
              <template v-if="index < 4">
                <p class="fc-caption text-on-surface-variant mb-2">
                  {{ exercise.description }}
                </p>
                <div class="text-secondary fc-body-strong">
                  {{ exercise.target }}
                </div>
              </template>
              <template v-else>
                <p class="fc-caption text-on-surface-variant mb-4">
                  Select your preferred aerobic finishing movement:
                </p>
                <v-radio-group
                  v-model="aerobicDraft"
                  color="secondary"
                  hide-details
                  @update:model-value="emit('update:aerobic', $event as string)"
                >
                  <v-radio
                    v-for="opt in aerobicOptions"
                    :key="opt.value"
                    :value="opt.value"
                    class="mb-2 pa-2 rounded border-accent"
                  >
                    <template v-slot:label>
                      <div class="d-flex align-center ga-3 py-1">
                        <v-icon
                          :color="
                            aerobicDraft === opt.value
                              ? 'secondary'
                              : 'on-surface-variant'
                          "
                          >{{ opt.icon }}</v-icon
                        >
                        <span class="fc-body text-on-surface">{{
                          opt.label
                        }}</span>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
                <div class="mt-4 p-3 rounded cardio-info">
                  <div class="d-flex align-center ga-2 text-secondary mb-1">
                    <v-icon size="small">mdi-timer-outline</v-icon>
                    <span class="fc-body-strong">Cardio Goal</span>
                  </div>
                  <p class="fc-caption text-on-surface-variant mb-0">
                    Aim for a steady heart rate for 6 consecutive minutes to
                    maximize metabolic boost.
                  </p>
                </div>
              </template>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="w-100 mt-6 mx-auto" style="max-width: 600px">
      <v-btn
        color="primary-container"
        block
        size="x-large"
        rounded="md"
        append-icon="mdi-chevron-right"
        @click="emit('next')"
      >
        <span class="fc-section">Continue to Final Step</span>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const emit = defineEmits<{
    (e: 'next'): void
    (e: 'update:aerobic', val: string): void
  }>()

  const expandedPanel = ref<number | undefined>(4)
  const aerobicDraft = ref('road-running')

  const exercises = [
    {
      name: 'Stretching',
      description: 'Full range mobility warm-up',
      target: '2:00 min',
    },
    {
      name: 'Sit-Ups',
      description: 'Core strength and hip flexor work',
      target: '12 reps',
    },
    {
      name: 'Back Extensions',
      description: 'Posterior chain activation',
      target: '10 reps',
    },
    {
      name: 'Push-Ups',
      description: 'Upper body pressing strength',
      target: '10 reps',
    },
    {
      name: 'Aerobic Exercise',
      description: 'Select your preferred cardio mode',
      target: '6:00 min',
    },
  ]

  const aerobicOptions = [
    { label: 'Road Running', value: 'road-running', icon: 'mdi-run' },
    { label: 'Brisk Walking', value: 'brisk-walking', icon: 'mdi-walk' },
    {
      label: 'Running on Spot',
      value: 'running-spot',
      icon: 'mdi-shoe-sneaker',
    },
    { label: 'Stationary Bike', value: 'stationary-bike', icon: 'mdi-bike' },
  ]
</script>

<style scoped>
  .border-top-accent {
    border-top: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
  }
  .border-accent {
    border: 1px solid rgba(var(--v-theme-outline-variant), 0.5);
  }
  .cardio-info {
    background: rgba(var(--v-theme-secondary), 0.1);
    border: 1px solid rgba(var(--v-theme-secondary), 0.2);
  }
</style>
