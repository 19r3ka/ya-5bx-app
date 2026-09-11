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

    <PostWorkoutDialog
      v-if="completedToken"
      v-model="showSummaryDialog"
      :session-token="completedToken"
    />
  </v-card>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import WorkoutTimer from '@/components/WorkoutTimer.vue'
  import ExerciseCard from './ExerciseCard.vue'
  import PostWorkoutDialog from './PostWorkoutDialog.vue'
  import { useTimer } from '@/composables/useTimer'
  import { useUser } from '@/composables/useUser'
  import { useWorkoutEngine } from '@/composables/useWorkoutEngine'
  import { useProgressionStore } from '@/stores/useProgressionStore'
  import { OrchestratorLifecycle } from '@/core/EngineTypes'
  import type { CompletedSessionRecord } from '@/core/StorageTypes'
  import { getExercisesForLevel } from '@/utils/levels'
  import type { Exercise } from '@/models/Exercise'

  const { user } = useUser()
  const { timer: currentTimer } = useTimer()
  const { t } = useI18n()
  const engine = useWorkoutEngine()
  const store = useProgressionStore()

  const workoutExercises = ref<Exercise[]>([])
  const hasValidLevel = ref(false)
  const showSummaryDialog = ref(false)
  const completedToken = ref('')

  const currentExercise = computed(
    () => workoutExercises.value[currentTimer.value.index]
  )

  const currentExerciseName = computed(() =>
    t(`${currentExercise.value?.translationKey}.name`)
  )
  const currentExerciseDescription = computed(() =>
    t(`${currentExercise.value?.translationKey}.description`)
  )

  watch(
    () => engine.getLifecycle(),
    async (newLifecycle) => {
      if (newLifecycle === OrchestratorLifecycle.COMPLETED) {
        const snap = engine.snapshot.value
        if (snap) {
          const record: Omit<CompletedSessionRecord, 'telemetryStatus'> = {
            version: 1,
            sessionToken: snap.sessionToken,
            completedAt: snap.lastUpdatedTimestamp || Date.now(),
            chartNumber: store.currentChart,
            levelString: store.currentLevel,
            durationSeconds: snap.totalElapsedSeconds,
          }
          await store.telemetryService.stagePendingSessionAsync(record)
          completedToken.value = snap.sessionToken
          showSummaryDialog.value = true
        }
      }
    }
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
