import type { ExerciseId } from './Exercise'
import type { LevelId } from './Level'

// Define the ChartId format using a template literal type.
// This will allow numbers starting from 1
export type ChartId = `C${number}`

// Interface for the Chart model
export interface Chart {
  id: ChartId
  name: string
  exerciseIds: [ExerciseId, ExerciseId, ExerciseId, ExerciseId, ExerciseId] // Fixed 5 exercises
  levelIds: [
    LevelId,
    LevelId,
    LevelId,
    LevelId,
    LevelId,
    LevelId,
    LevelId,
    LevelId,
  ] // Array of level IDs
}
