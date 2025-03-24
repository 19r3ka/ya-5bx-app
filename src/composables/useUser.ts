import { ref, type Ref } from 'vue'
import type { User } from '@/models/User'
import { LOCALSTORAGE_USER_KEY as USER_KEY } from '@/constants'

const user: Ref<User | null> = ref(null)

/* Load the user from localStorage */
const loadUser = () => {
  const storedUser = localStorage.getItem(USER_KEY)
  if (storedUser) {
    user.value = JSON.parse(storedUser) as User
  }
}

/* Save the user to localStorage and the user ref */
const saveUser = (newUser: User) => {
  user.value = newUser
  localStorage.setItem(USER_KEY, JSON.stringify(newUser))
}

export const useUser = () => {
  return {
    user,
    saveUser,
    loadUser,
  }
}
