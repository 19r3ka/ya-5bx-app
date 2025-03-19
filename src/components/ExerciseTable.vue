<template>
  <v-card class="mt-4">
    <v-data-table hide-default-footer>
      <thead>
        <tr>
          <th>{{ LEVEL_HEADER_LABEL }}</th>
          <th v-for="exercise in exercises" :key="exercise.id">
            {{ exercise.name }}
          </th>
          <th>{{ RUN_HEADER_LABEL }}</th>
          <th>{{ WALK_HEADER_LABEL }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(level, index) in levels" :key="level.id">
          <td>{{ levelLabels[index] }}</td>
          <td v-for="(rep, index) in level.reps" :key="index">{{ rep }}</td>
        </tr>
        <tr>
          <td>{{ MINUTES_PER_EXERCISE_LABEL }}</td>
          <td v-for="(time, index) in EXERCISE_TIMES" :key="index">
            {{ time }}
          </td>
          "
        </tr>
      </tbody>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
  import type { Exercise } from '@/models/Exercise'
  import type { Level } from '@/models/Level'
  import { EXERCISE_LEVELS as levelLabels, EXERCISE_TIMES } from '@/constants'

  //   TODO: Refactor for i18n integration. "EN" by default
  const LEVEL_HEADER_LABEL = 'level'
  const RUN_HEADER_LABEL = '1-mile run'
  const WALK_HEADER_LABEL = '2-mile walk'
  const MINUTES_PER_EXERCISE_LABEL = 'Minutes for each exercise'

  defineProps<{
    exercises: Exercise[]
    levels: Level[]
  }>()
</script>
