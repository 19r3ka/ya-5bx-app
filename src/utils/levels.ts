import { LEVEL_ID_SEPARATOR } from '@/constants'
import ageGroupData from '@/data/ageGroups.json'
import type { AgeGroup } from '@/models/AgeGroup'
import type { LevelId } from '@/models/Level'
import { getChartExercises } from './charts'
import type { Exercise } from '@/models/Exercise'
import levelsData from '@/data/levels.json'

const ageGroups = ageGroupData as AgeGroup[]

/* Get the goal Chart level for a given user age */
export const getGoalLevelByAge = (age: number): LevelId | null => {
  // if the user is older than the original oldest age group, default to that group's oldest age, i.e. 60
  const olderAgeGroup = ageGroups[ageGroups.length - 1]

  if (age > olderAgeGroup?.maxAge) return olderAgeGroup?.goalLevel

  const ageGroup = ageGroups.find(
    (group: AgeGroup) => age >= group.minAge && age <= group.maxAge
  )
  return ageGroup ? (ageGroup.goalLevel as LevelId) : null
}

/* Extract chart and level from a given LevelId value, e.g. C1_B- */
export const extractChartAndLevel = (levelId: string) =>
  levelId.split(LEVEL_ID_SEPARATOR)

/**
 * Generates an array of Exercise objects based on the provided LevelId.
 *
 * @param {LevelId} levelId - The ID of the level for which to generate exercises.
 * @returns {Exercise[]} An array of Exercise objects with reps information.
 * @throws {Error} If the level is not found in the levels data.
 */
export function getExercisesForLevel(levelId: LevelId): Exercise[] {
  const [userChart] = extractChartAndLevel(levelId)
  const levelExercises = getChartExercises(userChart)
  const levelData = levelsData.find((level) => level.id === levelId)

  if (!levelData) {
    throw new Error(`Level with ID ${levelId} not found.`)
  }

  const levelReps = levelData.reps

  // Add the "reps" attribute to each exercise object.
  levelExercises.forEach((exercise, index) => {
    exercise.reps = levelReps[index]
  })

  return levelExercises
}
