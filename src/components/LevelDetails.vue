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
  import levelsData from '@/data/levels.json'
  import type { LevelId } from '@/models/Level'
  import { getChartExercises } from '@/utils/charts'
  import { extractChartAndLevel } from '@/utils/levels'

  // take a Levelid as prop
  const props = defineProps<{
    levelId: LevelId
  }>()

  const [userChart] = extractChartAndLevel(props.levelId)

  const levelExercises = getChartExercises(userChart)
  const levelReps =
    levelsData.find((level) => level.id === props.levelId)?.reps || []

  //   for each exercise object, add a "reps" attribute corresponding to the reps in levelReps. Index is key.
  levelExercises.forEach((exercise, index) => {
    exercise.reps = levelReps[index]
  })

  // Replace with your actual data fetching logic
  const [firstFourExercises, lastThreeExercises] = [
    levelExercises.slice(0, 4),
    levelExercises.slice(4, 7),
  ]
</script>
