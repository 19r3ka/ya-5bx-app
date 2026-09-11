<template>
  <v-container class="pa-0 fill-height flex-column bg-background" fluid>
    <!-- Top AppBar -->
    <header
      class="w-100 px-6 pt-4 pb-0 bg-surface d-flex align-center justify-space-between h-touch-target-min position-sticky top-0 app-header"
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

    <main class="flex-grow-1 w-100 px-6 pb-32 pt-6 mx-auto main-content">
      <!-- Dashboard Header -->
      <div
        class="mb-8 d-flex flex-column flex-md-row justify-space-between align-md-end ga-4"
      >
        <div>
          <h2 class="fc-section text-primary text-uppercase mb-1">
            YOUR PROGRESS
          </h2>
          <p class="fc-body text-content-secondary">
            Current Stage: C{{ progressionStore.currentChart }} | Level
            {{ progressionStore.currentLevel }}
          </p>
        </div>
        <div class="d-flex ga-4">
          <v-card
            color="surface"
            class="pa-4 border-surface-variant rounded-lg d-flex flex-column align-center stat-card"
          >
            <span class="fc-caption text-content-tertiary text-uppercase"
              >Completed</span
            >
            <span class="fc-exercise text-secondary stat-number">24</span>
          </v-card>
          <v-card
            color="surface"
            class="pa-4 border-surface-variant rounded-lg d-flex flex-column align-center stat-card"
          >
            <span class="fc-caption text-content-tertiary text-uppercase"
              >Accuracy</span
            >
            <span class="fc-exercise text-primary stat-number">92%</span>
          </v-card>
        </div>
      </div>

      <!-- Progression Map Grid -->
      <ProgressionMapGrid
        :current-level-id="`C${progressionStore.currentChart}_${progressionStore.currentLevel}`"
        goal-level-id="C3_A+"
        :is-hydrated="progressionStore.isHydrated"
      />

      <!-- Stats Grid -->
      <v-row>
        <v-col cols="12" md="8">
          <v-card
            color="surface"
            class="pa-6 border-surface-variant rounded-lg h-100 d-flex flex-column justify-space-between"
          >
            <h4 class="fc-section text-on-surface mb-4 text-uppercase">
              WEEKLY CONSISTENCY
            </h4>
            <!-- Mock Chart -->
            <div
              class="d-flex align-end justify-space-between ga-2 chart-container"
            >
              <div
                v-for="(col, i) in weeklyData"
                :key="i"
                class="w-100 bg-surface-elevated rounded-t-lg position-relative d-flex flex-column justify-end"
              >
                <div
                  :class="
                    col.active
                      ? col.pct === 100
                        ? 'bg-primary'
                        : 'bg-secondary'
                      : 'bg-surface-variant'
                  "
                  :style="{ height: col.pct + '%' }"
                  class="rounded-t-lg w-100 transition-all"
                ></div>
              </div>
            </div>
            <div
              class="d-flex justify-space-between mt-4 fc-caption text-content-tertiary"
            >
              <span
                v-for="(col, i) in weeklyData"
                :key="i"
                :class="{ 'text-primary font-weight-bold': i === 3 }"
                >{{ col.day }}</span
              >
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="pa-6 rounded-lg border-primary-variant h-100 d-flex flex-column justify-space-between position-relative overflow-hidden milestone-card"
          >
            <div class="position-relative z-index-10">
              <h4 class="fc-section text-primary mb-2 text-uppercase">
                NEXT MILESTONE
              </h4>
              <p class="fc-body text-on-surface text-sm">
                Reach <b>C3 Level A+</b> to unlock the advanced flexibility
                routine.
              </p>
            </div>
            <div class="position-relative mt-6 z-index-10">
              <div
                class="d-flex justify-space-between fc-caption text-on-surface mb-2"
              >
                <span>Progress</span>
                <span>88%</span>
              </div>
              <v-progress-linear
                model-value="88"
                color="primary"
                bg-color="surface-elevated"
                rounded
                height="8"
              ></v-progress-linear>
            </div>
            <v-icon size="96" class="position-absolute milestone-icon"
              >mdi-medal</v-icon
            >
          </v-card>
        </v-col>
      </v-row>
    </main>

    <AppHelpDialog v-model="showHelp" />
  </v-container>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import ProgressionMapGrid from '@/components/progress/ProgressionMapGrid.vue'
  import { useProgressionStore } from '@/stores/useProgressionStore'
  import AppHelpDialog from '@/components/common/AppHelpDialog.vue'

  const progressionStore = useProgressionStore()
  const showHelp = ref(false)

  onMounted(() => {
    if (!progressionStore.isHydrated) {
      progressionStore.initAsync()
    }
  })

  const weeklyData = [
    { day: 'M', pct: 60, active: true },
    { day: 'T', pct: 85, active: true },
    { day: 'W', pct: 40, active: true },
    { day: 'T', pct: 100, active: true },
    { day: 'F', pct: 10, active: false },
    { day: 'S', pct: 10, active: false },
    { day: 'S', pct: 10, active: false },
  ]
</script>

<style scoped>
  .app-header {
    z-index: 50;
  }
  .main-content {
    max-width: 1200px;
  }
  .stat-card {
    min-width: 100px;
  }
  .stat-number {
    font-size: 24px;
  }
  .chart-container {
    height: 128px;
  }
  .milestone-card {
    background-color: rgba(var(--v-theme-primary-container), 0.1);
  }
  .z-index-10 {
    z-index: 10;
  }
  .milestone-icon {
    bottom: -16px;
    right: -16px;
    opacity: 0.1;
    color: rgb(var(--v-theme-primary));
  }
  .border-surface-variant {
    border: 1px solid rgba(var(--v-theme-surface-variant), 0.5);
  }
  .border-primary-variant {
    border: 1px solid rgba(var(--v-theme-primary), 0.2);
  }
</style>
