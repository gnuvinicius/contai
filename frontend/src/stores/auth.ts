import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import { AuthService } from '@/services/auth.service'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'
import { tokenStorage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useStorage<string | null>('contai.accessToken', null)
  const refreshToken = useStorage<string | null>('contai.refreshToken', null)
  const user = useStorage<User | null>('contai.user', null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function applySession(params: {
    access: string
    refresh?: string
    user: User
  }): void {
    accessToken.value = params.access
    refreshToken.value = params.refresh ?? null
    user.value = params.user

    tokenStorage.setAccessToken(params.access)
    tokenStorage.setRefreshToken(params.refresh)
  }

  function clearSession(): void {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    tokenStorage.clear()
  }

  async function login(payload: LoginPayload): Promise<void> {
    isLoading.value = true
    try {
      const response = await AuthService.login(payload)
      applySession(response)
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<void> {
    isLoading.value = true
    try {
      const response = await AuthService.register(payload)
      applySession(response)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    clearSession,
  }
})
