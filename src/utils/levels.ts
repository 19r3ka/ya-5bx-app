import { LEVEL_ID_SEPARATOR } from '@/constants'
import ageGroupData from '@/data/ageGroups.json'
import type { AgeGroup } from '@/models/AgeGroup'
import type { LevelId } from '@/models/Level'

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
