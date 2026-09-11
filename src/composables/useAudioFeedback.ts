import { ref } from 'vue'

const isUnlocked = ref(false)

export function useAudioFeedback() {
  const unlock = () => {
    if (isUnlocked.value) return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtx) {
        const audioCtx = new AudioCtx()
        if (audioCtx.state === 'suspended') {
          audioCtx.resume()
        }
      }
      isUnlocked.value = true
    } catch {
      // ignore
    }
  }

  return {
    unlock,
    isUnlocked,
  }
}
