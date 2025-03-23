<template>
  <v-card class="mt-4">
    <v-data-table hide-default-footer>
      <thead>
        <tr>
          <th>{{ $t('exerciseTable.levelHeader') }}</th>
          <th v-for="exercise in exercises" :key="exercise.id">
            {{ $t(`${exercise.translationKey}.name`) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(level, index) in levels" :key="level.id">
          <td>{{ levelLabels[index] }}</td>
          <td v-for="(rep, index) in level.reps" :key="index">{{ rep }}</td>
        </tr>
        <tr>
          <td>{{ $t('exerciseTable.minutesPerExercise') }}</td>
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

  defineProps<{
    exercises: Exercise[]
    levels: Level[]
  }>()
</script>
