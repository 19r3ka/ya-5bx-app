import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { EXERCISE_TIMES, LOCAL_STORAGE_TIMER_KEY } from '@/constants'

export const useTimer = () => {
  const isRunning = ref(false)
  const currentTime = ref(0)
  const currentIndex = ref(0)
  const intervalId = ref<number | undefined>(undefined)

  const totalTime = computed(() =>
    EXERCISE_TIMES.reduce((total, time) => total + time, 0)
  )
  const currentTimerTime = computed(() => EXERCISE_TIMES[currentIndex.value])
  const remainingTime = computed(
    () => currentTime.value - currentTimerTime.value
  )

  /* starts a timer */
  function run() {
    if (isRunning.value) {
      return
    }
    isRunning.value = true
    intervalId.value = setInterval(() => {
      currentTime.value++
      if (currentTime.value >= currentTimerTime.value) {
        nextTimer()
      }
    }, 1000)
  }

  /* stops the running timer */
  function stop() {
    if (!isRunning.value) {
      return
    }
    isRunning.value = false
    clearInterval(intervalId.value)
    intervalId.value = undefined
  }

  /* resets the timers in the interval series */
  function reset() {
    stop()
    currentTime.value = 0
    currentIndex.value = 0
  }

  /* moves to the next timer in the array */
  function nextTimer() {
    if (currentIndex.value >= EXERCISE_TIMES.length - 1) {
      stop()
      return
    }
    currentIndex.value++
    currentTime.value = 0
  }

  /* moves to the previous timer in the array */
  function previousTimer() {
    if (currentIndex.value <= 0) return
    currentIndex.value--
    currentTime.value = 0
  }

  function skipToTimer(timerId: number) {
    if (timerId < 0 || timerId >= EXERCISE_TIMES.length) return
    currentIndex.value = timerId
    currentTime.value = 0
  }

  /* saves the current timer state to localStorage */
  function saveTimerState() {
    const currentState = {
      isRunning: isRunning.value,
      time: currentTime.value,
      index: currentIndex.value,
    }
    localStorage.setItem(LOCAL_STORAGE_TIMER_KEY, JSON.stringify(currentState))
  }

  /* loads the previous timer state from localStorage */
  function loadTimerState() {
    const savedState = localStorage.getItem(LOCAL_STORAGE_TIMER_KEY)
    if (!savedState) return
    try {
      const { isRunning, time, index } = JSON.parse(savedState)
      isRunning.value = isRunning
      currentTime.value = time
      currentIndex.value = index
    } catch (error) {
      console.warn('Error loading timer state from localStorage:', error)
    }
  }

  onMounted(() => {
    loadTimerState()
  })

  onUnmounted(() => {
    stop() // Ensure timer is stopped on unmount
  })

  watchEffect(() => {
    saveTimerState() // Ensure timer state is saved whenever any dependency variables changes.
  })

  return {
    isRunning,
    currentTime,
    currentIndex,
    totalTime,
    currentTimerTime,
    remainingTime,
    run,
    stop,
    reset,
    nextTimer,
    previousTimer,
    skipToTimer,
  }
}
