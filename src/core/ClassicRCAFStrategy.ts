import type {
  IWorkoutStrategy,
  WorkoutGenerationContext,
  WorkoutInterval,
} from './EngineTypes'
import { AerobicOption } from './EngineTypes'
import chartsMatrixJson from './data/charts_matrix.json'
import exerciseDictionaryJson from './data/exercise_dictionary.json'

interface ExerciseVariant {
  volume_scaler_coefficient: number
}

interface ExerciseEntry {
  displayName: string
  variants: {
    classic_rcaf: ExerciseVariant
    modern_safe: ExerciseVariant
  }
}

type ExerciseDictionary = Record<string, ExerciseEntry>

interface ChartLevelData {
  exercise_1_reps: number
  exercise_2_reps: number
  exercise_3_reps: number
  exercise_4_reps: number
  exercise_5_stationary_steps: number
  outdoor_run_target_minutes: number
  walk_target_minutes: number
}

type ChartsMatrix = Record<string, Record<string, ChartLevelData>>

const chartsMatrix = chartsMatrixJson as unknown as ChartsMatrix
const exerciseDictionary =
  exerciseDictionaryJson as unknown as ExerciseDictionary

export class ClassicRCAFStrategy implements IWorkoutStrategy {
  public generateWorkout(context: WorkoutGenerationContext): WorkoutInterval[] {
    const chartKey = context.chartNumber.toString()
    const levelKey = context.levelString

    const chartData = chartsMatrix[chartKey]?.[levelKey]
    if (!chartData) {
      throw new Error(
        `Chart data not found for chart ${chartKey} level ${levelKey}`
      )
    }

    // Helper to scale repetitions/volume
    const getScaledVolume = (exerciseId: string, rawVolume: number): number => {
      const entry = exerciseDictionary[exerciseId]
      if (!entry) {
        return rawVolume
      }
      const variant = context.isModernSafeMode
        ? entry.variants.modern_safe
        : entry.variants.classic_rcaf
      const coefficient = variant.volume_scaler_coefficient
      return Math.round(rawVolume * coefficient)
    }

    const intervals: WorkoutInterval[] = []

    // 1. Exercise 1: Toe Touch
    const ex1Reps = getScaledVolume('ex_1', chartData.exercise_1_reps)
    intervals.push({
      exerciseId: 'ex_1',
      durationSeconds: 120,
      displayName: 'Toe Touch',
      description: `Perform Toe Touch repetitions: ${ex1Reps}`,
      translationKey: 'exercise.e1',
    })

    // 2. Exercise 2: Sit Up / Crunch (Safe Mode switches to Crunch)
    const ex2Reps = getScaledVolume('ex_2', chartData.exercise_2_reps)
    const ex2Name = context.isModernSafeMode ? 'Abdominal Crunch' : 'Sit Up'
    intervals.push({
      exerciseId: 'ex_2',
      durationSeconds: 60,
      displayName: ex2Name,
      description: `Perform ${ex2Name} repetitions: ${ex2Reps}`,
      translationKey: 'exercise.e2',
    })

    // 3. Exercise 3: Leg Lift
    const ex3Reps = getScaledVolume('ex_3', chartData.exercise_3_reps)
    intervals.push({
      exerciseId: 'ex_3',
      durationSeconds: 60,
      displayName: 'Leg Lift',
      description: `Perform Leg Lift repetitions: ${ex3Reps}`,
      translationKey: 'exercise.e3',
    })

    // 4. Exercise 4: Push Up
    const ex4Reps = getScaledVolume('ex_4', chartData.exercise_4_reps)
    intervals.push({
      exerciseId: 'ex_4',
      durationSeconds: 60,
      displayName: 'Push Up',
      description: `Perform Push Up repetitions: ${ex4Reps}`,
      translationKey: 'exercise.e4',
    })

    // 5. Exercise 5: Aerobic
    if (context.aerobicSelection === AerobicOption.STATIONARY_RUN) {
      const rawSteps = chartData.exercise_5_stationary_steps
      const scaledSteps = getScaledVolume('ex_5', rawSteps)
      intervals.push({
        exerciseId: 'ex_5',
        durationSeconds: 360,
        displayName: 'Stationary Run',
        description: `Perform ${scaledSteps} stationary steps`,
        translationKey: 'exercise.e5',
      })
    } else if (context.aerobicSelection === AerobicOption.OUTDOOR_RUN_1_MILE) {
      const minutes = chartData.outdoor_run_target_minutes
      const durationSeconds = Math.round(minutes * 60)
      intervals.push({
        exerciseId: 'ex_5',
        durationSeconds,
        displayName: 'Outdoor Run (1 Mile)',
        description: `Run 1 Mile in target: ${minutes} minutes`,
        translationKey: 'exercise.e5',
      })
    } else {
      const minutes = chartData.walk_target_minutes
      const durationSeconds = Math.round(minutes * 60)
      intervals.push({
        exerciseId: 'ex_5',
        durationSeconds,
        displayName: 'Walk (2 Miles)',
        description: `Walk 2 Miles in target: ${minutes} minutes`,
        translationKey: 'exercise.e5',
      })
    }

    return intervals
  }
}
