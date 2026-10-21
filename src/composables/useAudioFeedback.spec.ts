import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface FakeAudioContext {
  state: 'suspended' | 'running'
  resume: ReturnType<typeof vi.fn>
}

let contexts: FakeAudioContext[] = []
let initialState: 'suspended' | 'running' = 'suspended'

class AudioContextStub implements FakeAudioContext {
  state: 'suspended' | 'running' = initialState
  resume = vi.fn().mockResolvedValue(undefined)

  constructor() {
    contexts.push(this)
  }
}

async function loadComposable() {
  vi.resetModules()
  return import('@/composables/useAudioFeedback')
}

describe('useAudioFeedback', () => {
  beforeEach(() => {
    contexts = []
    initialState = 'suspended'
    vi.stubGlobal('AudioContext', AudioContextStub)
    vi.stubGlobal('webkitAudioContext', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('unlocks and resumes a suspended AudioContext', async () => {
    const { useAudioFeedback } = await loadComposable()
    const { unlock, isUnlocked } = useAudioFeedback()

    unlock()

    expect(isUnlocked.value).toBe(true)
    expect(contexts).toHaveLength(1)
    expect(contexts[0].resume).toHaveBeenCalledTimes(1)
  })

  it('is idempotent on repeat calls', async () => {
    const { useAudioFeedback } = await loadComposable()
    const { unlock } = useAudioFeedback()

    unlock()
    unlock()

    expect(contexts).toHaveLength(1)
    expect(contexts[0].resume).toHaveBeenCalledTimes(1)
  })

  it('does not resume an already running context', async () => {
    initialState = 'running'
    const { useAudioFeedback } = await loadComposable()
    const { unlock } = useAudioFeedback()

    unlock()

    expect(contexts).toHaveLength(1)
    expect(contexts[0].resume).not.toHaveBeenCalled()
  })

  it('does not throw when AudioContext is absent', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    const { useAudioFeedback } = await loadComposable()
    const { unlock, isUnlocked } = useAudioFeedback()

    expect(() => unlock()).not.toThrow()
    expect(isUnlocked.value).toBe(true)
  })
})
