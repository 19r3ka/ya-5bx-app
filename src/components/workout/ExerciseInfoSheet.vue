<template>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="t-xl" class="pa-6 bg-surface-elevated">
      <div class="d-flex justify-space-between align-start mb-6">
        <div>
          <h3 class="fc-exercise text-on-surface text-uppercase mb-1">
            {{ exercise?.name || 'Exercise' }}
          </h3>
          <span
            class="fc-caption text-secondary text-uppercase font-weight-bold tracking-wide"
            >Info & Technique</span
          >
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="emit('update:modelValue', false)"
        ></v-btn>
      </div>

      <p class="fc-body text-on-surface-variant mb-6">
        {{
          exercise?.description ||
          'Exercise description and technique instructions go here. Ensure full range of motion.'
        }}
      </p>

      <div
        class="d-flex justify-space-between align-center px-4 py-3 bg-surface rounded-lg border-surface-variant"
      >
        <span class="fc-caption text-on-surface-variant text-uppercase"
          >Target</span
        >
        <span class="fc-rep-target text-primary target-number">{{
          exercise?.target || '15 REPS'
        }}</span>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean
    exercise?: { name: string; description: string; target: string }
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void
  }>()
</script>
