<template>
  <v-container class="pa-0 fill-height flex-column bg-background" fluid>
    <!-- Top Bar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min position-sticky top-0 header-bar"
    >
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-weight-lifter</v-icon>
        <span class="fc-section text-primary">YA-5BX</span>
      </div>
      <v-btn
        icon="mdi-help-circle-outline"
        variant="text"
        color="on-surface-variant"
        @click="showHelp = true"
      ></v-btn>
    </header>

    <main class="flex-grow-1 w-100 px-6 pb-32 pt-8 mx-auto dashboard-container">
      <!-- Greeting Section -->
      <section class="mb-6">
        <p
          class="fc-caption text-content-secondary text-uppercase mb-1 tracking-wider"
        >
          Dashboard
        </p>
        <h2 class="fc-exercise text-on-surface">Good morning, Recruit</h2>
      </section>

      <!-- Today's Workout Card -->
      <v-card
        color="surface"
        rounded="lg"
        class="mb-6 position-relative overflow-hidden workout-card"
      >
        <div class="position-absolute bg-watermark">
          <v-icon size="180">mdi-run</v-icon>
        </div>

        <div class="pa-6 d-flex flex-column h-100">
          <div class="d-flex justify-space-between align-start mb-4">
            <div>
              <h3 class="fc-section text-primary mb-1">TODAY'S WORKOUT</h3>
              <p class="fc-body-strong text-on-surface font-size-20">
                Chart 1 · Level D+
              </p>
            </div>
            <div
              class="bg-surface-elevated px-3 py-1 rounded-lg border-surface-variant d-flex align-center"
            >
              <span class="fc-timer text-primary timer-text">11:00</span>
              <span class="fc-caption text-content-secondary ml-1">EST.</span>
            </div>
          </div>

          <div class="mt-8 mb-6">
            <div class="d-flex justify-space-between align-end mb-2">
              <span class="fc-caption text-content-secondary"
                >WEEKLY PROGRESS</span
              >
              <span class="fc-body-strong text-secondary">3 of 4 Sessions</span>
            </div>
            <v-progress-linear
              model-value="75"
              color="secondary"
              bg-color="surface-variant"
              height="12"
              rounded
            />
          </div>

          <v-btn
            color="primary-container"
            block
            size="x-large"
            rounded="lg"
            class="text-on-primary-container mt-auto"
            @click="startWorkout"
          >
            <span class="fc-section font-size-20">START WORKOUT</span>
            <v-icon end>mdi-play</v-icon>
          </v-btn>
        </div>
      </v-card>

      <!-- Stats Grid -->
      <v-row class="mb-6">
        <v-col cols="6">
          <v-card
            rounded="lg"
            class="pa-5 h-100 d-flex flex-column justify-space-between streak-card"
          >
            <div class="d-flex justify-space-between mb-4">
              <v-icon color="secondary">mdi-lightning-bolt</v-icon>
              <span class="fc-caption text-secondary">STREAK</span>
            </div>
            <div>
              <p class="fc-rep-target text-on-surface line-height-1">12</p>
              <p class="fc-body text-on-surface-variant mt-1">Days Active</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card
            color="surface-elevated"
            rounded="lg"
            class="pa-5 h-100 d-flex flex-column justify-space-between border-surface-variant"
          >
            <div class="d-flex justify-space-between mb-4">
              <v-icon color="primary">mdi-medal</v-icon>
              <span class="fc-caption text-content-secondary">LEVEL</span>
            </div>
            <div>
              <p class="fc-rep-target text-primary line-height-1">D+</p>
              <p class="fc-body text-content-secondary mt-1">
                Advance in 2 days
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Last Session Summary -->
      <section class="mb-6">
        <div class="d-flex align-center ga-4 mb-4">
          <h3 class="fc-section text-content-secondary text-uppercase">
            Last Session Summary
          </h3>
          <v-divider></v-divider>
        </div>
        <v-row dense>
          <v-col v-for="(ex, i) in lastSession" :key="i" cols="6">
            <v-card
              color="surface"
              class="pa-4 border-surface-variant rounded-lg"
            >
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon size="small" color="content-secondary"
                  >mdi-check-circle-outline</v-icon
                >
                <p class="fc-caption text-content-secondary text-uppercase">
                  {{ ex.name }}
                </p>
              </div>
              <p class="fc-body-strong font-size-18">{{ ex.val }}</p>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </main>

    <AppHelpDialog v-model="showHelp" />
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AppHelpDialog from '@/components/common/AppHelpDialog.vue'

  const router = useRouter()
  const showHelp = ref(false)

  const lastSession = [
    { name: 'Push-ups', val: '22 Reps' },
    { name: 'Sit-ups', val: '34 Reps' },
    { name: 'Flexibility', val: '2:00 Min' },
    { name: 'Running', val: '6:00 Min' },
  ]

  function startWorkout() {
    if (router) {
      router.push({ name: 'workout-setup' })
    }
  }
</script>

<style scoped>
  .header-bar {
    z-index: 50;
  }
  .dashboard-container {
    max-width: 600px;
  }
  .tracking-wider {
    letter-spacing: 2px;
  }
  .workout-card {
    border-left: 4px solid rgb(var(--v-theme-primary-container));
  }
  .bg-watermark {
    right: -40px;
    top: -40px;
    opacity: 0.05;
  }
  .font-size-20 {
    font-size: 20px;
  }
  .timer-text {
    font-size: 18px;
    line-height: 24px;
  }
  .streak-card {
    background-color: rgba(var(--v-theme-secondary), 0.1);
  }
  .line-height-1 {
    line-height: 1;
  }
  .font-size-18 {
    font-size: 18px;
  }
  .border-surface-variant {
    border: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
  }
</style>
