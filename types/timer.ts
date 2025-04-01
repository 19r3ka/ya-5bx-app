// /src/types/timer.ts (or /src/types/index.ts if you prefer)

export interface Timer {
  index: number // Index of the timer within the interval/workout
  elapsedSeconds: number // Seconds elapsed in the current timer
  remainingSeconds: number // Seconds remaining in the current timer
  durationSeconds: number // Total duration of the timer in seconds
}

export interface IntervalWorkout {
  totalTimers: number // Total number of timers in the workout
  currentTimerIndex: number // Index of the currently running timer
  totalWorkoutTimeSeconds: number // Total duration of the entire workout
  remainingWorkoutTimeSeconds: number // Remaining time in the entire workout
  timers: number[] // Array of timers in the workout
}
