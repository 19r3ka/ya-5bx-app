/* Calculate user age from their birthdate */
export function calculateAge(dob: Date | string): number {
  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const birthMonth = birthDate.getMonth()
  const birthDay = birthDate.getDate()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()

  // Adjust age if the birthday hasn't occurred this year
  if (
    todayMonth < birthMonth ||
    (todayMonth === birthMonth && todayDay < birthDay)
  ) {
    age--
  }

  return age
}

export function getGoalChartByAge(age: number): number {
  if (age < 26) return 6
  if (age <= 29) return 5
  if (age <= 34) return 4
  if (age <= 44) return 3
  if (age <= 54) return 2
  return 1
}

export function getAgeRangeLabel(age: number): string {
  if (age < 26) return '18–25'
  if (age <= 29) return '26–29'
  if (age <= 34) return '30–34'
  if (age <= 39) return '35–39'
  if (age <= 44) return '40–44'
  if (age <= 49) return '45–49'
  if (age <= 54) return '50–54'
  return '55+'
}
