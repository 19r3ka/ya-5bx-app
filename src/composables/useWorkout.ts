import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import type { Exercise } from '@/models/Exercise'
import { LOCAL_STORAGE_WORKOUT_KEY } from '@/constants'

export const useWorkout = () => {
  const exercises = ref<Exercise[]>([])
  const currentExerciseIndex = ref(0)
  const isWorkingOut = ref(false)
  const workoutCompleted = ref(false)

  const currentExercise = computed(
    () => exercises.value[currentExerciseIndex.value] || null
  )

  const reset = (newExercises: Exercise[]) => {
    exercises.value = newExercises
    currentExerciseIndex.value = 0
    isWorkingOut.value = false
    workoutCompleted.value = false
  }

  const nextExercise = () => {
    if (currentExerciseIndex.value < exercises.value.length - 1) {
      currentExerciseIndex.value++
    } else {
      workoutCompleted.value = true
      isWorkingOut.value = false
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex.value > 0) {
      currentExerciseIndex.value--
    }
  }

  const startWorkout = () => {
    isWorkingOut.value = true
  }

  const saveWorkoutState = () => {
    localStorage.setItem(
      LOCAL_STORAGE_WORKOUT_KEY,
      JSON.stringify({
        currentExerciseIndex: currentExerciseIndex.value,
        isWorkingOut: isWorkingOut.value,
        workoutCompleted: workoutCompleted.value,
      })
    )
  }

  const loadWorkoutState = () => {
    const storedWorkoutData = localStorage.getItem(LOCAL_STORAGE_WORKOUT_KEY)
    if (!storedWorkoutData) return
    try {
      const workoutData = JSON.parse(storedWorkoutData)
      currentExerciseIndex.value = workoutData.currentExerciseIndex
      isWorkingOut.value = workoutData.isWorkingOut
      workoutCompleted.value = workoutData.workoutCompleted
    } catch (error) {
      console.warn('Error loading workout data from localStorage:', error)
    }
  }

  onMounted(() => {
    loadWorkoutState()
  })

  watchEffect(() => {
    saveWorkoutState()
  })

  onUnmounted(() => {
    saveWorkoutState() // Save on unmount to persist changes
  })

  return {
    exercises,
    currentExercise,
    isWorkingOut,
    workoutCompleted,
    reset,
    nextExercise,
    previousExercise,
    startWorkout,
  }
}
