<template>
  <v-card class="pa-2" flat>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-avatar :image="icon" size="large"></v-avatar>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-center">
        <p class="text-h5 font-weight-bold">{{ reps }}</p>
      </v-col>
    </v-row>
  </v-card>
</template>
<script setup lang="ts">
  import type { Exercise } from '@/models/Exercise'

  const props = defineProps<{
    exercise: Exercise
  }>()

  const { icon, reps } = props.exercise
</script>
