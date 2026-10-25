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
