import { ref, computed, onMounted, onUnmounted } from 'vue'
import { EXERCISE_TIMES, LOCAL_STORAGE_TIMER_KEY } from '@/constants'
import type { Timer, IntervalWorkout } from 'types/timer'

// Helper function to convert time in seconds into minutes and seconds
export function formatDisplayTime(time: number): string {
  const SECONDS_IN_MINUTE = 60
  const minutes = Math.floor(time / SECONDS_IN_MINUTE)
  const seconds = time % SECONDS_IN_MINUTE
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// Global state variables
const allTimersCompleted = ref(false)
// Initialize workout with constant data
const workout = ref<IntervalWorkout>({
  totalTimers: EXERCISE_TIMES.length,
  timers: EXERCISE_TIMES,
  currentTimerIndex: 0,
  totalWorkoutTimeSeconds: EXERCISE_TIMES.reduce(
    (total, time) => total + time,
    0
  ),
  remainingWorkoutTimeSeconds: EXERCISE_TIMES.reduce(
    (total, time) => total + time,
    0
  ),
})

// Initialize timer
const timer = ref<Timer>({
  index: 0,
  elapsedSeconds: 0,
  remainingSeconds: 0,
  durationSeconds: 0,
})

const intervalId = ref<number | null>(null) // the interval must be unique to avoid duplicates

export const useTimer = () => {
  const isRunning = ref(false)

  const currentTimerProgressPercentage = computed(
    () => (timer.value.remainingSeconds / timer.value.durationSeconds) * 100
  )

  // Helper Functions

  /**
   * Updates timer value based on workout current timer's index
   */
  function updateTimer() {
    timer.value.index = workout.value.currentTimerIndex
    timer.value.elapsedSeconds = 0
    timer.value.remainingSeconds = timer.value.durationSeconds =
      workout.value.timers[workout.value.currentTimerIndex]
  }

  /**
   * Updates the "remainingWorkoutTimeSeconds" in the workout object.
   * @param timerRunning - Whether to subtract the current timer's elapsed time
   */
  function updateWorkoutRemainingSeconds(timerRunning = false) {
    workout.value.remainingWorkoutTimeSeconds = workout.value.timers
      .slice(workout.value.currentTimerIndex)
      .reduce((total, time) => total + time, 0)

    // Deduct elapsed time if timer is running
    if (timerRunning) {
      workout.value.remainingWorkoutTimeSeconds -= timer.value.elapsedSeconds
    }
  }

  /**
   * Saves the current timer state to localStorage.
   */
  function saveTimerState() {
    const currentState = {
      timerRunning: isRunning.value,
      timer: timer.value,
      workoutIndex: workout.value.currentTimerIndex,
    }
    localStorage.setItem(LOCAL_STORAGE_TIMER_KEY, JSON.stringify(currentState))
  }

  /**
   * Loads the previous timer state from localStorage.
   */
  function loadTimerState() {
    const savedState = localStorage.getItem(LOCAL_STORAGE_TIMER_KEY)
    if (!savedState) return false

    try {
      const savedData = JSON.parse(savedState)
      timer.value = savedData.timer
      workout.value.currentTimerIndex =
        savedData.workoutIndex || timer.value.index

      // Only record the running state, don't start yet
      return savedData.timerRunning
    } catch (error) {
      console.warn('Error loading timer state from localStorage:', error)
      return false
    }
  }

  // Timer Actions

  /**
   * Starts the timer, ensuring any previous timer is cleared first.
   */
  function startTimer() {
    // Clear any existing interval first to prevent duplicates
    stopTimer()

    isRunning.value = true
    intervalId.value = window.setInterval(() => {
      timer.value.elapsedSeconds++
      timer.value.remainingSeconds--
      workout.value.remainingWorkoutTimeSeconds--

      if (timer.value.remainingSeconds <= 0) {
        goToNextTimer()
      }
    }, 1000)
  }

  /**
   * Stops the running timer.
   */
  function stopTimer() {
    isRunning.value = false
    if (intervalId.value !== null) {
      window.clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  /**
   * Resets the timers in the interval series.
   */
  function resetWorkout() {
    stopTimer()
    workout.value.currentTimerIndex = 0
    workout.value.remainingWorkoutTimeSeconds =
      workout.value.totalWorkoutTimeSeconds
    allTimersCompleted.value = false
    updateTimer()
  }

  /**
   * Moves to the next timer in the array.
   */
  function goToNextTimer() {
    stopTimer()
    if (workout.value.currentTimerIndex >= workout.value.totalTimers - 1) {
      allTimersCompleted.value = true
      return
    }

    workout.value.currentTimerIndex++
    updateWorkoutRemainingSeconds()
    updateTimer()
    startTimer()
  }

  /**
   * Moves to the previous timer in the array.
   */
  function goToPreviousTimer() {
    stopTimer()
    if (workout.value.currentTimerIndex <= 0) return

    workout.value.currentTimerIndex--
    updateWorkoutRemainingSeconds()
    updateTimer()
  }

  /**
   * Jumps to a specific timer in the array.
   * @param timerId - The index of the timer to jump to.
   */
  function goToTimer(timerId: number) {
    stopTimer()
    if (timerId < 0 || timerId >= workout.value.totalTimers) return

    workout.value.currentTimerIndex = timerId
    updateWorkoutRemainingSeconds()
    updateTimer()
  }

  // Lifecycle hooks
  onMounted(() => {
    // Remove any existing event listeners first
    window.removeEventListener('beforeunload', handleBeforeUnload)

    // Setup clean event listener
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Initialize timer state
    const shouldStartTimer = loadTimerState()
    updateWorkoutRemainingSeconds(shouldStartTimer)

    // Start timer if it was running before
    if (shouldStartTimer) {
      startTimer()
    }
  })

  onUnmounted(() => {
    saveTimerState()
    stopTimer()
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  // Handler function for beforeunload event
  function handleBeforeUnload() {
    saveTimerState()
    stopTimer()
  }

  return {
    // State
    allTimersCompleted,
    isRunning,
    workout,
    timer,

    // Computed
    currentTimerProgressPercentage,

    // Actions
    startTimer,
    stopTimer,
    resetWorkout,
    goToNextTimer,
    goToPreviousTimer,
    goToTimer,
  }
}
