import type {
  IWorkoutStrategy,
  WorkoutGenerationContext,
  WorkoutInterval,
} from './EngineTypes'
import exerciseDictionaryJson from './data/exercise_dictionary.json'
import exerciseSubstitutionsJson from './data/exercise_substitutions.json'

// Compile-Time Nominal Key Validation
type MasterExerciseKey = keyof typeof exerciseDictionaryJson
type SubstitutionKey = keyof typeof exerciseSubstitutionsJson

// Compile-time check asserting every key in exerciseSubstitutions matches master exercise dictionary
type ValidateKeys<T extends MasterExerciseKey> = T
type CheckedSubstitutionKeys = ValidateKeys<SubstitutionKey>

export class McMasterHIITStrategy implements IWorkoutStrategy {
  public generateWorkout(context: WorkoutGenerationContext): WorkoutInterval[] {
    const intervals: WorkoutInterval[] = []

    // Look up substitutions matrix
    const substitutions: Record<string, string> = exerciseSubstitutionsJson

    const getExerciseKey = (key: CheckedSubstitutionKeys): string => {
      if (
        context.isModernSafeMode ||
        (context.profile.age && context.profile.age >= 60)
      ) {
        return substitutions[key] || key
      }
      return key
    }

    const activeKey = getExerciseKey('mcmaster_active')
    const recoveryKey = getExerciseKey('mcmaster_recovery')

    const activeDict = exerciseDictionaryJson[activeKey as MasterExerciseKey]
    const recoveryDict =
      exerciseDictionaryJson[recoveryKey as MasterExerciseKey]

    // 9-block matrix: 5 active work intervals (60s) interleaved with 4 walking recovery intervals (60s)
    // Sequence: Active (1), Recovery (1), Active (2), Recovery (2), Active (3), Recovery (3), Active (4), Recovery (4), Active (5)
    // Total sequence duration: 5 * 60 + 4 * 60 = 540 seconds.
    for (let i = 0; i < 5; i++) {
      intervals.push({
        exerciseId: activeKey,
        durationSeconds: 60,
        displayName: activeDict?.displayName || 'HIIT Active Work',
        description: `High Intensity Interval ${i + 1} of 5 (60s)`,
        translationKey: activeDict?.translationKey,
      })

      if (i < 4) {
        intervals.push({
          exerciseId: recoveryKey,
          durationSeconds: 60,
          displayName: recoveryDict?.displayName || 'HIIT Recovery',
          description: `Walking Recovery Interval ${i + 1} of 4 (60s)`,
          translationKey: recoveryDict?.translationKey,
        })
      }
    }

    return intervals
  }
}
