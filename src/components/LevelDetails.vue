<template>
  <v-card class="pa-4 mb-4">
    <v-card-title class="text-h6 font-weight-bold">{{
      $t('levelDetails.title')
    }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          v-for="(exercise, index) in firstFourExercises"
          :key="index"
          cols="3"
        >
          <ExerciseCard :exercise="exercise" />
        </v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <v-row>
        <v-col
          v-for="(exercise, index) in lastThreeExercises"
          :key="index"
          cols="4"
        >
          <ExerciseCard :exercise="exercise" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import ExerciseCard from '@/components/ExerciseCard.vue'
  import type { LevelId } from '@/models/Level'
  import { getExercisesForLevel } from '@/utils/levels'

  // take a Levelid as prop
  const props = defineProps<{
    levelId: LevelId
  }>()

  const levelExercises = getExercisesForLevel(props.levelId)

  // Replace with your actual data fetching logic
  const [firstFourExercises, lastThreeExercises] = [
    levelExercises.slice(0, 4),
    levelExercises.slice(4, 7),
  ]
</script>
