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
