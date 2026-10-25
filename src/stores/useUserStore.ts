import { defineStore } from 'pinia'
import {
  STORAGE_KEY_ONBOARDING_DRAFT,
  LOCALSTORAGE_USER_KEY,
} from '@/constants'
import { safeRemove, safeWriteJson } from '@/utils/storage'

export interface UserProfile {
  name?: string
  dob?: Date | string
  age?: number
  currentLevel?: string
  goalLevel?: string
  preferredAerobic?: string
  isOnboardingCompleted: boolean
}

export const useUserStore = defineStore('user', {
  state: () => {
    let savedDraft = {
      step: 1,
      age: null as number | null,
      aerobic: 'stationary',
    }
    try {
      const draftStr = localStorage.getItem(STORAGE_KEY_ONBOARDING_DRAFT)
      if (draftStr) {
        const parsed = JSON.parse(draftStr)
        savedDraft = {
          step: parsed.step ?? parsed.currentStep ?? 1,
          age: parsed.age ?? null,
          aerobic: parsed.aerobic ?? 'stationary',
        }
      }
    } catch {
      // ignore
    }

    let savedProfile: UserProfile | null = null
    try {
      const userStr = localStorage.getItem(LOCALSTORAGE_USER_KEY)
      if (userStr) {
        const parsed = JSON.parse(userStr)
        savedProfile = {
          ...parsed,
          isOnboardingCompleted: parsed.isOnboardingCompleted ?? true,
        }
      }
    } catch {
      // ignore
    }

    return {
      profile: savedProfile as UserProfile | null,
      draftStep: savedDraft.step,
      draftAge: savedDraft.age,
      draftAerobic: savedDraft.aerobic,
      storageWriteFailed: false,
    }
  },
  actions: {
    persistDraft() {
      const ok = safeWriteJson(STORAGE_KEY_ONBOARDING_DRAFT, {
        step: this.draftStep,
        currentStep: this.draftStep,
        age: this.draftAge,
        aerobic: this.draftAerobic,
      })
      this.storageWriteFailed = !ok
    },
    setDraftStep(step: number) {
      this.draftStep = step
      this.persistDraft()
    },
    setDraftAge(age: number) {
      this.draftAge = age
      this.persistDraft()
    },
    setDraftAerobic(val: string) {
      this.draftAerobic = val
      this.persistDraft()
    },
    setPreferredAerobic(aerobic: string) {
      if (this.profile) {
        this.profile.preferredAerobic = aerobic
        this.storageWriteFailed = !safeWriteJson(
          LOCALSTORAGE_USER_KEY,
          this.profile
        )
      }
    },
    completeOnboarding(profileData?: Partial<UserProfile>) {
      this.profile = {
        isOnboardingCompleted: true,
        preferredAerobic: this.draftAerobic,
        ...profileData,
      }
      const ok = safeWriteJson(LOCALSTORAGE_USER_KEY, this.profile)
      this.storageWriteFailed = !ok
      if (ok) {
        safeRemove(STORAGE_KEY_ONBOARDING_DRAFT)
      }
    },
  },
})
