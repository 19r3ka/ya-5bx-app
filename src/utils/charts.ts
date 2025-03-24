import type { Exercise } from '@/models/Exercise' // Import your Exercise type
import chartsData from '@/data/charts.json' // Import your charts data
import exercisesData from '@/data/exercises.json' // Import your exercises data

const exercises = exercisesData as Exercise[]

export const getChartExercises = (chartId: string): Exercise[] => {
  // Find the chart data object
  const chart = chartsData.find((chart) => chart.id === chartId)

  // Handle case where chart is not found
  if (!chart) {
    console.error(`Chart with ID "${chartId}" not found.`)
    return [] // Return an empty array if chart is not found
  }

  // Extract exercise IDs
  const exerciseIds = chart.exerciseIds

  // Look up exercise data and create Exercise objects
  const chartExercises: Exercise[] = exerciseIds.map((exerciseId) => {
    const exercise = exercises.find((exercise) => exercise.id === exerciseId)

    // Handle case where exercise is not found
    if (!exercise) {
      console.warn(
        `Exercise with ID "${exerciseId}" not found for chart "${chartId}".`
      )
      return {
        id: exerciseId,
        translationKey: '',
        illustration: '',
        icon: '',
      } as Exercise // Return a default exercise if not found
    }

    return exercise
  })

  return chartExercises
}
