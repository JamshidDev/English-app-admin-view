import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginPayload, type Admin } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<Admin | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(payload: LoginPayload) {
    const { data } = await authApi.login(payload)
    token.value = data.data.accessToken
    user.value = data.data.admin
    localStorage.setItem('token', data.data.accessToken)
  }

  async function fetchUser() {
    try {
      const { data } = await authApi.me()
      user.value = data.data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isAuthenticated, login, fetchUser, logout }
})
