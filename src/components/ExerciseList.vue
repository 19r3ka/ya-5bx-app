<template>
  <v-expansion-panels>
    <v-expansion-panel v-for="exercise in exercises" :key="exercise.id">
      <v-expansion-panel-title expand-icon="mdi-menu-down">
        <v-avatar class="me-3">
          <v-img :src="exercise.illustration" alt="Exercise Image" />
        </v-avatar>
        <span>{{ $t(`${exercise.translationKey}.name`) }}</span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>{{ $t(`${exercise.translationKey}.description`) }}</p>
        <v-img :src="exercise.illustration" alt="Exercise Image" class="mt-4" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
  import type { Exercise } from '@/models/Exercise'

  defineProps<{
    exercises: Exercise[]
  }>()
</script>
