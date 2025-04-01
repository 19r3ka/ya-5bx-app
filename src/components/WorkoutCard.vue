<template>
  <v-card class="workout-card pa-4">
    <v-card-title class="text-h5">
      {{ $t('workoutCard.title') }}
    </v-card-title>

    <v-card-text v-if="hasValidLevel">
      <v-row>
        <v-col cols="12" md="7" lg="8">
          <v-card class="exercise-info-card py-4 mb-4">
            <v-row align="stretch" justify="center">
              <v-col cols="4">
                <ExerciseCard :exercise="currentExercise" />
              </v-col>
              <v-col cols="8">
                <div class="exercise-details">
                  <v-card-title>
                    {{ currentExerciseName }}
                  </v-card-title>
                  <v-card-text>
                    {{ currentExerciseDescription }}
                  </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" md="5" lg="4">
          <WorkoutTimer />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-else>
      <div class="text-center">
        <p>You need to set your current level to start a workout.</p>
        <p>Please go to your profile to set your level.</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import WorkoutTimer from '@/components/WorkoutTimer.vue'
  import ExerciseCard from './ExerciseCard.vue'
  import { useTimer } from '@/composables/useTimer'
  import { useUser } from '@/composables/useUser'
  import { getExercisesForLevel } from '@/utils/levels'
  import type { Exercise } from '@/models/Exercise'

  const { user } = useUser()
  const { timer: currentTimer } = useTimer()
  const { t } = useI18n()

  const workoutExercises = ref<Exercise[]>([])
  const hasValidLevel = ref(false)

  const currentExercise = computed(
    () => workoutExercises.value[currentTimer.value.index]
  )

  const currentExerciseName = computed(() =>
    t(`${currentExercise.value?.translationKey}.name`)
  )
  const currentExerciseDescription = computed(() =>
    t(`${currentExercise.value?.translationKey}.description`)
  )

  const loadExercises = () => {
    if (!user.value?.currentLevel) {
      console.warn('User does not have a currentLevel set.')
      return false
    }
    try {
      workoutExercises.value = getExercisesForLevel(user.value?.currentLevel)
      return true
    } catch (error) {
      console.error('Error getting exercises for level:', error)
      return false
    }
  }

  onMounted(() => {
    hasValidLevel.value = loadExercises()
  })
</script>
