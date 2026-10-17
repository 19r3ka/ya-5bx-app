<template>
  <div class="d-flex gap-1 justify-center py-3">
    <div
      v-for="step in 6"
      :key="step"
      class="progress-pip"
      :class="{ active: step <= currentStep }"
    />
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    currentStep: number
  }>()
</script>

<style scoped>
  .progress-pip {
    width: 24px;
    height: 4px;
    border-radius: 2px;
    background: rgb(var(--v-theme-surface-variant));
    transition: background 300ms ease;
  }
  .progress-pip.active {
    background: rgb(var(--v-theme-primary));
  }
</style>
