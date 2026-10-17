<template>
  <v-card color="surface-elevated" rounded="lg" class="pa-4 goal-card">
    <div class="d-flex align-start ga-4">
      <v-icon color="primary" class="mt-1">mdi-chart-line-variant</v-icon>
      <div>
        <h3 class="fc-body-strong text-on-surface mb-1">
          Peak fitness target for age group {{ ageRange }}
        </h3>
        <p class="fc-body text-on-surface-variant mb-0 muted-text">
          Targeting Chart {{ chartNumber }} for optimal metabolic efficiency,
          cardiovascular longevity, and core stabilization.
        </p>
      </div>
    </div>
    <div class="mt-4 pt-4 d-flex justify-space-between align-end card-footer">
      <div class="d-flex align-end ga-1 bar-chart">
        <div class="bar bar-1"></div>
        <div class="bar bar-2"></div>
        <div class="bar bar-3"></div>
        <div class="bar bar-4"></div>
        <div class="bar bar-5"></div>
      </div>
      <span class="fc-caption text-uppercase font-weight-bold tracking-tight"
        >Chart {{ chartNumber }} Target</span
      >
    </div>
  </v-card>
</template>

<script setup lang="ts">
  defineProps<{
    chartNumber: number
    ageRange: string
  }>()
</script>

<style scoped>
  .goal-card {
    border-left: 3px solid rgb(var(--v-theme-primary-container));
  }
  .muted-text {
    opacity: 0.9;
  }
  .card-footer {
    border-top: 1px solid rgba(var(--v-theme-primary-container), 0.2);
  }
  .bar-chart {
    height: 32px;
  }
  .bar {
    width: 8px;
    border-radius: 4px 4px 0 0;
  }
  .bar-1 {
    height: 12px;
    background: rgba(var(--v-theme-primary-container), 0.4);
  }
  .bar-2 {
    height: 20px;
    background: rgba(var(--v-theme-primary-container), 0.4);
  }
  .bar-3 {
    height: 32px;
    background: rgba(var(--v-theme-primary-container), 0.8);
  }
  .bar-4 {
    height: 16px;
    background: rgba(var(--v-theme-primary-container), 0.4);
  }
  .bar-5 {
    height: 8px;
    background: rgba(var(--v-theme-primary-container), 0.2);
  }
  .tracking-tight {
    letter-spacing: -0.5px;
  }
</style>
