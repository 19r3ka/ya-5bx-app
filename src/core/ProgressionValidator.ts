import type {
  UserProfile,
  LevelHistorySnapshot,
  ValidationResult,
} from './EngineTypes'
import progressionRulesJson from './data/progression_rules.json'

interface ProgressionRule {
  ageMin?: number
  ageMax?: number
  requiredSessions: number
}

const progressionRules: ProgressionRule[] =
  progressionRulesJson as ProgressionRule[]

export class ProgressionValidator {
  public validate(
    profile: UserProfile,
    snapshot: LevelHistorySnapshot
  ): ValidationResult {
    const age = profile.age

    if (age < 0 || isNaN(age)) {
      return {
        isEligible: false,
        reasonCode: 'INVALID_AGE',
        requiredSessions: 0,
        remainingSessions: 0,
      }
    }

    // Find the matching progression rule based on age
    const rule = progressionRules.find((r: ProgressionRule): boolean => {
      const minAge = r.ageMin ?? -Infinity
      const maxAge = r.ageMax ?? Infinity
      return age >= minAge && age <= maxAge
    })

    if (!rule) {
      return {
        isEligible: false,
        reasonCode: 'INVALID_AGE',
        requiredSessions: 0,
        remainingSessions: 0,
      }
    }

    let required = rule.requiredSessions
    if (snapshot.userFlaggedStiffOrSore) {
      required += 1
    }

    const completed = snapshot.verifiedCompletedSessionsAtCurrentLevel
    const remaining = Math.max(0, required - completed)

    if (snapshot.userFlaggedStiffOrSore) {
      return {
        isEligible: false,
        reasonCode: 'USER_TELEMETRY_RESTRICTION',
        requiredSessions: required,
        remainingSessions: remaining,
      }
    }

    if (remaining > 0) {
      return {
        isEligible: false,
        reasonCode: 'VOLUME_QUOTA_INCOMPLETE',
        requiredSessions: required,
        remainingSessions: remaining,
      }
    }

    return {
      isEligible: true,
      reasonCode: 'ELIGIBLE',
      requiredSessions: required,
      remainingSessions: 0,
    }
  }
}
