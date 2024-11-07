import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userData = ref<any>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  const setUser = async (newUser: User | null) => {
    user.value = newUser
    if (newUser) {
      const userDoc = await getDoc(doc(db, 'users', newUser.uid))
      userData.value = userDoc.data()
    } else {
      userData.value = null
    }
  }

  // Initialize auth state
  auth.onAuthStateChanged((newUser) => {
    setUser(newUser)
  })

  return {
    user,
    userData,
    loading,
    isAuthenticated,
    setUser
  }
})