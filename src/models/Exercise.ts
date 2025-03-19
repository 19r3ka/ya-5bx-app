// Define the ExerciseId format using a template literal type.
//this will allow numbers starting from 1
export type ExerciseId = `E${number}`

// Interface for the Exercise model
export interface Exercise {
  id: ExerciseId
  translationKey: string // Key to the translation in the i18n messages
  illustration: string // Path to asset
}
