// Define the ExerciseId format using a template literal type.
//this will allow numbers starting from 1
export type ExerciseId = `E${number}`

// Interface for the Exercise model
export interface Exercise {
  id: ExerciseId
  name: string
  description: string
  illustration: string // Path to asset
}
