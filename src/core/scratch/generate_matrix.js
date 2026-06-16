import fs from 'fs'
import path from 'path'

const charts = {}
const levelsList = [
  'D-',
  'D',
  'D+',
  'C-',
  'C',
  'C+',
  'B-',
  'B',
  'B+',
  'A-',
  'A',
  'A+',
]

for (let chart = 1; chart <= 6; chart++) {
  charts[chart] = {}
  for (let idx = 0; idx < levelsList.length; idx++) {
    const lvl = levelsList[idx]
    charts[chart][lvl] = {
      exercise_1_reps: chart * 2 + idx + 2,
      exercise_2_reps: chart * 2 + idx + 3,
      exercise_3_reps: chart * 2 + idx + 4,
      exercise_4_reps: chart * 2 + idx + 1,
      exercise_5_stationary_steps: 100 + chart * 50 + idx * 25,
      outdoor_run_target_minutes: 15 - chart + idx * 0.5,
      walk_target_minutes: 30 - chart * 2 + idx,
    }
  }
}

const dir = './src/core/data'
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

fs.writeFileSync(
  path.join(dir, 'charts_matrix.json'),
  JSON.stringify(charts, null, 2)
)
console.log('Successfully generated charts_matrix.json')
