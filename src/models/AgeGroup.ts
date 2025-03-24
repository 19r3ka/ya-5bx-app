import type { LevelId } from './Level'

export interface AgeGroup {
  minAge: number
  maxAge: number
  goalLevel: LevelId
}
