import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import {
  LOCALSTORAGE_USER_KEY,
  STORAGE_KEY_ONBOARDING_DRAFT,
} from '@/constants'

function seedUser(value: unknown): void {
  localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(value))
}

function seedDraft(value: unknown): void {
  localStorage.setItem(STORAGE_KEY_ONBOARDING_DRAFT, JSON.stringify(value))
}

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('hydrates the profile and draft from localStorage', () => {
    seedUser({ name: 'Ada', age: 33, currentLevel: 'C3_B' })
    seedDraft({ step: 2, age: 33, aerobic: 'walk' })

    const store = useUserStore()

    expect(store.profile).toEqual({
      name: 'Ada',
      age: 33,
      currentLevel: 'C3_B',
      isOnboardingCompleted: true,
    })
    expect(store.draftStep).toBe(2)
    expect(store.draftAge).toBe(33)
    expect(store.draftAerobic).toBe('walk')
  })

  it('falls back to defaults when storage is malformed', () => {
    localStorage.setItem(LOCALSTORAGE_USER_KEY, '{not json')
    localStorage.setItem(STORAGE_KEY_ONBOARDING_DRAFT, '{not json')

    const store = useUserStore()

    expect(store.profile).toBeNull()
    expect(store.draftStep).toBe(1)
    expect(store.draftAge).toBeNull()
    expect(store.draftAerobic).toBe('stationary')
  })

  it('defaults isOnboardingCompleted to true when absent', () => {
    seedUser({ age: 30 })

    const store = useUserStore()

    expect(store.profile?.isOnboardingCompleted).toBe(true)
  })

  it('reports a failed draft write without throwing', () => {
    const store = useUserStore()
    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota exceeded')
    })

    expect(() => store.setDraftStep(3)).not.toThrow()
    expect(store.storageWriteFailed).toBe(true)
  })

  it('clears the write-failure flag after a later successful write', () => {
    const store = useUserStore()
    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota exceeded')
    })

    store.setDraftStep(2)
    expect(store.storageWriteFailed).toBe(true)

    store.setDraftStep(3)
    expect(store.storageWriteFailed).toBe(false)
  })

  it('keeps the previously stored profile when the profile write fails', () => {
    seedUser({ age: 30, currentLevel: 'C1_D-' })
    const store = useUserStore()
    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota exceeded')
    })

    store.completeOnboarding({ age: 31 })

    const stored = JSON.parse(
      localStorage.getItem(LOCALSTORAGE_USER_KEY) ?? '{}'
    )
    expect(stored.age).toBe(30)
    expect(store.profile?.age).toBe(31)
    expect(store.storageWriteFailed).toBe(true)
  })

  it('keeps the onboarding draft when the profile write fails', () => {
    seedDraft({ step: 3, age: 30, aerobic: 'walk' })
    const store = useUserStore()
    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota exceeded')
    })

    store.completeOnboarding({ age: 30 })

    expect(localStorage.getItem(STORAGE_KEY_ONBOARDING_DRAFT)).not.toBeNull()
    expect(store.storageWriteFailed).toBe(true)
  })

  it('completes onboarding with the draft aerobic option and clears the draft', () => {
    seedDraft({ step: 3, age: 30, aerobic: 'walk' })
    const store = useUserStore()

    store.completeOnboarding({ age: 30, currentLevel: 'C1_D-' })

    expect(store.profile).toEqual({
      isOnboardingCompleted: true,
      preferredAerobic: 'walk',
      age: 30,
      currentLevel: 'C1_D-',
    })
    expect(
      JSON.parse(localStorage.getItem(LOCALSTORAGE_USER_KEY) ?? '{}')
    ).toEqual(store.profile)
    expect(localStorage.getItem(STORAGE_KEY_ONBOARDING_DRAFT)).toBeNull()
  })

  it('persists the preferred aerobic option', () => {
    seedUser({ age: 30 })
    const store = useUserStore()

    store.setPreferredAerobic('outdoor')

    expect(store.profile?.preferredAerobic).toBe('outdoor')
    expect(
      JSON.parse(localStorage.getItem(LOCALSTORAGE_USER_KEY) ?? '{}')
        .preferredAerobic
    ).toBe('outdoor')
  })
})
