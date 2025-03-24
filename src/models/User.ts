import type { LevelId } from './Level'

// Define the User interface with optional name and required fields
export interface User {
  name?: string // Optional name
  dob: Date | string
  currentLevel: LevelId // e.g., "C2_A+"
  goalLevel: LevelId // e.g., "C6_A+"
}
