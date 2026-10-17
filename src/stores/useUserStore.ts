import { defineStore } from 'pinia'
import {
  STORAGE_KEY_ONBOARDING_DRAFT,
  LOCALSTORAGE_USER_KEY,
} from '@/constants'

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
    }
  },
  actions: {
    persistDraft() {
      localStorage.setItem(
        STORAGE_KEY_ONBOARDING_DRAFT,
        JSON.stringify({
          step: this.draftStep,
          currentStep: this.draftStep,
          age: this.draftAge,
          aerobic: this.draftAerobic,
        })
      )
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
        localStorage.setItem(
          LOCALSTORAGE_USER_KEY,
          JSON.stringify(this.profile)
        )
      }
    },
    completeOnboarding(profileData?: Partial<UserProfile>) {
      this.profile = {
        isOnboardingCompleted: true,
        preferredAerobic: this.draftAerobic,
        ...profileData,
      }
      localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(this.profile))
      localStorage.removeItem(STORAGE_KEY_ONBOARDING_DRAFT)
    },
  },
})
