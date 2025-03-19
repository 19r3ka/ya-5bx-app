<template>
  <v-card class="pa-4">
    <!-- Chart Title -->
    <v-card-title>
      {{ chart.name }}
    </v-card-title>

    <!-- Chart Description -->
    <v-card-text>
      <p>{{ $t('chartCard.description') }}</p>
    </v-card-text>

    <!-- Exercises Section -->
    <v-divider></v-divider>
    <v-card-subtitle class="mt-4">{{
      $t('chartCard.exerciseDescriptions')
    }}</v-card-subtitle>
    <v-card-text>
      <ExerciseList :exercises="chartExercises" />
    </v-card-text>

    <!-- Levels Section -->
    <v-card-subtitle class="mt-4">{{
      $t('chartCard.exerciseRepetitionsByLevel')
    }}</v-card-subtitle>
    <v-card-text>
      <ExerciseTable :exercises="chartExercises" :levels="chartLevels" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import ExerciseTable from '@/components/ExerciseTable.vue'

  import type { Chart } from '@/models/Chart'
  import type { Exercise } from '@/models/Exercise'
  import type { Level } from '@/models/Level'

  import exerciseData from '@/data/exercises.json'
  import levelData from '@/data/levels.json'
  import ExerciseList from './ExerciseList.vue'

  const props = defineProps<{
    chart: Chart
  }>()

  const exercises = exerciseData as Exercise[]
  const levels = levelData as Level[]

  const chartExercises = props.chart
    ? props.chart.exerciseIds
        .map((id) => exercises.find((exercise) => exercise.id === id))
        .filter(
          (exercise): exercise is (typeof exercises)[number] =>
            exercise !== undefined
        )
    : []
  const chartLevels = props.chart
    ? levels.filter((level) => level.chartId === props.chart.id)
    : []
</script>
