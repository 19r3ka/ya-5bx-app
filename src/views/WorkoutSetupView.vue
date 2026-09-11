<template>
  <v-container class="pa-0 fill-height flex-column bg-background" fluid>
    <!-- Top AppBar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min position-sticky top-0 header-bar"
    >
      <div class="d-flex align-center ga-4">
        <v-icon color="primary">mdi-weight-lifter</v-icon>
        <span class="fc-section text-primary text-uppercase">YA-5BX</span>
      </div>
      <v-btn
        icon="mdi-help-circle-outline"
        variant="text"
        color="on-surface-variant"
        @click="showHelp = true"
      ></v-btn>
    </header>

    <main class="flex-grow-1 w-100 px-6 pb-32 pt-8 mx-auto setup-container">
      <!-- Section Header -->
      <div class="mb-8">
        <h2
          class="fc-section text-on-surface text-uppercase mb-1 tracking-wider"
        >
          TODAY'S SESSION
        </h2>
        <div class="accent-line"></div>
      </div>

      <!-- Routine Overview -->
      <v-card color="surface" rounded="lg" class="pa-6 mb-8 overview-card">
        <h3
          class="fc-body-strong text-primary mb-2 d-flex align-center ga-2 text-uppercase"
        >
          <v-icon size="small">mdi-format-list-bulleted</v-icon>
          Routine Overview
        </h3>
        <p class="fc-caption text-content-secondary mb-6">
          Complete these blocks in sequence to finish today's training quota.
        </p>

        <div class="d-flex flex-column ga-3">
          <v-card
            color="surface"
            class="pa-4 d-flex align-center justify-space-between rounded-lg border-accent"
          >
            <div class="d-flex align-center ga-4">
              <v-avatar color="surface-elevated" class="text-primary">
                <v-icon>mdi-human-handsup</v-icon>
              </v-avatar>
              <div>
                <p class="fc-body-strong text-on-surface">Stretching</p>
                <p class="fc-caption text-content-tertiary">
                  Warm-up · 2 Minutes
                </p>
              </div>
            </div>
            <span class="fc-timer text-content-secondary font-size-18"
              >02:00</span
            >
          </v-card>

          <v-card
            color="surface"
            class="pa-4 d-flex align-center justify-space-between rounded-lg border-accent"
          >
            <div class="d-flex align-center ga-4">
              <v-avatar color="surface-elevated" class="text-primary">
                <v-icon>mdi-weight-lifter</v-icon>
              </v-avatar>
              <div>
                <p class="fc-body-strong text-on-surface">Sit-ups</p>
                <p class="fc-caption text-content-tertiary">3 Sets · 15 Reps</p>
              </div>
            </div>
            <span class="fc-rep-target text-content-secondary font-size-18"
              >45 Total</span
            >
          </v-card>

          <v-card
            color="surface"
            class="pa-4 d-flex align-center justify-space-between rounded-lg border-accent"
          >
            <div class="d-flex align-center ga-4">
              <v-avatar color="surface-elevated" class="text-primary">
                <v-icon>mdi-human</v-icon>
              </v-avatar>
              <div>
                <p class="fc-body-strong text-on-surface">Push-ups</p>
                <p class="fc-caption text-content-tertiary">
                  2 Sets · Max Reps
                </p>
              </div>
            </div>
            <v-icon color="content-tertiary">mdi-trending-up</v-icon>
          </v-card>

          <v-card
            color="surface"
            class="pa-4 d-flex align-center justify-space-between rounded-lg border-accent"
          >
            <div class="d-flex align-center ga-4">
              <v-avatar color="surface-dim" class="text-content-tertiary">
                <v-icon>mdi-run</v-icon>
              </v-avatar>
              <div>
                <p class="fc-body-strong text-content-tertiary">
                  Aerobic Exercise
                </p>
                <p class="fc-caption text-content-tertiary font-italic">
                  Select type below
                </p>
              </div>
            </div>
            <v-icon color="content-tertiary">mdi-dots-horizontal</v-icon>
          </v-card>
        </div>
      </v-card>

      <!-- Aerobic Selection -->
      <v-card color="surface" rounded="lg" class="pa-6 border-accent mb-12">
        <h3
          class="fc-section text-on-surface text-uppercase mb-6 tracking-wider"
        >
          AEROBIC SELECTION
        </h3>
        <v-radio-group v-model="aerobic" color="primary" hide-details>
          <v-radio
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            class="mb-3 pa-4 rounded-lg transition-all radio-option"
            :class="{ 'radio-selected': aerobic === opt.value }"
          >
            <template v-slot:label>
              <div class="d-flex align-center ga-4 w-100 py-1">
                <v-icon
                  :color="aerobic === opt.value ? 'primary' : 'secondary'"
                  >{{ opt.icon }}</v-icon
                >
                <span
                  class="fc-body-strong"
                  :class="
                    aerobic === opt.value ? 'text-primary' : 'text-on-surface'
                  "
                  >{{ opt.label }}</span
                >
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card>

      <!-- Call to Action -->
      <div class="d-flex justify-center">
        <v-btn
          color="primary-container"
          size="x-large"
          rounded="lg"
          class="px-8 text-on-primary-container h-auto py-5 start-btn"
          @click="beginWorkout"
        >
          <span class="fc-section text-uppercase btn-text">Begin workout</span>
          <v-icon end size="32">mdi-play</v-icon>
        </v-btn>
      </div>
    </main>

    <AppHelpDialog v-model="showHelp" />
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAudioFeedback } from '@/composables/useAudioFeedback'
  import AppHelpDialog from '@/components/common/AppHelpDialog.vue'

  const router = useRouter()
  const { unlock } = useAudioFeedback()
  const showHelp = ref(false)

  const aerobic = ref('stationary')
  const options = [
    { value: 'outdoor', label: 'Outdoor run', icon: 'mdi-pine-tree' },
    { value: 'treadmill', label: 'Treadmill', icon: 'mdi-speedometer' },
    { value: 'stationary', label: 'Stationary run', icon: 'mdi-run' },
    { value: 'walk', label: 'Brisk walk', icon: 'mdi-walk' },
  ]

  function beginWorkout() {
    unlock()
    if (router) {
      router.push({ name: 'active-workout' })
    }
  }
</script>

<style scoped>
  .header-bar {
    z-index: 50;
  }
  .setup-container {
    max-width: 600px;
  }
  .tracking-wider {
    letter-spacing: 2px;
  }
  .accent-line {
    height: 4px;
    width: 48px;
    background-color: rgb(var(--v-theme-primary));
  }
  .overview-card {
    border-left: 4px solid rgb(var(--v-theme-primary));
  }
  .border-accent {
    border: 1px solid rgba(var(--v-theme-outline-variant), 0.5);
  }
  .font-size-18 {
    font-size: 18px;
  }
  .radio-option {
    border: 2px solid transparent;
    background-color: rgb(var(--v-theme-surface-elevated));
  }
  .radio-selected {
    border: 2px solid rgb(var(--v-theme-primary));
    background-color: rgb(var(--v-theme-surface-elevated));
  }
  .start-btn {
    width: 100%;
  }
  .btn-text {
    font-size: 24px;
    letter-spacing: 2px;
  }
</style>
