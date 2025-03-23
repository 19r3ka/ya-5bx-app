import type { ChartId } from './Chart'

// Define valid grades using a literal type
export type Grade = 'D-' | 'D+' | 'C-' | 'C+' | 'B-' | 'B+' | 'A-' | 'A+'

// Define the id format using a template literal type
export type LevelId = `${ChartId}_${Grade}`

// Level interface
export interface Level {
  id: LevelId
  chartId: ChartId
  grade: Grade
  reps: [number, number, number, number, number, number, number]
}
