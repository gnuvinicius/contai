import {
    ApiError,
    apiRequest,
    clearStoredTokens,
    getStoredAccessToken,
    getStoredRefreshToken,
    setStoredTokens,
} from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface JwtPayload {
  user_id?: number
  roles?: string[]
  is_staff?: boolean
  is_superuser?: boolean
  exp?: number
}

interface AuthProfile {
  userId: number | null
  username: string
  roles: string[]
  isStaff: boolean
  isSuperuser: boolean
}

interface LoginPayload {
  username: string
  password: string
}

interface RegisterPayload {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

interface TokenResponse {
  access: string
  refresh: string
}

interface RegisterResponse {
  id: number
  email: string
  groups: string[]
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return atob(padded)
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload
  } catch {
    return null
  }
}

function isExpired(token: string | null) {
  if (!token) return true

  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false

  return Date.now() >= payload.exp * 1000 - 30_000
}

function profileFromToken(token: string, fallbackUsername = ''): AuthProfile {
  const payload = decodeJwtPayload(token)

  return {
    userId: payload?.user_id ?? null,
    username: fallbackUsername,
    roles: payload?.roles ?? [],
    isStaff: payload?.is_staff ?? false,
    isSuperuser: payload?.is_superuser ?? false,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getStoredAccessToken())
  const refreshToken = ref<string | null>(getStoredRefreshToken())
  const profile = ref<AuthProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const displayName = computed(() => profile.value?.username || 'Usuário')
  const roles = computed(() => profile.value?.roles ?? [])
  const isUserGroup = computed(() => roles.value.includes('user'))

  function syncProfile(username = '') {
    if (!accessToken.value) {
      profile.value = null
      return
    }

    profile.value = profileFromToken(accessToken.value, username)
  }

  function setSession(tokens: TokenResponse, username = '') {
    accessToken.value = tokens.access
    refreshToken.value = tokens.refresh
    setStoredTokens(tokens)
    syncProfile(username)
  }

  async function refreshSession() {
    if (!refreshToken.value) return false

    const response = await apiRequest<{ access: string }>('/auth/token/refresh/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ refresh: refreshToken.value }),
    })

    accessToken.value = response.access
    setStoredTokens({ access: response.access })
    syncProfile(profile.value?.username ?? '')
    return true
  }

  async function bootstrap() {
    if (initialized.value) return

    initialized.value = true

    if (!accessToken.value && !refreshToken.value) {
      return
    }

    try {
      if (accessToken.value && !isExpired(accessToken.value)) {
        syncProfile(profile.value?.username ?? '')
        return
      }

      const refreshed = await refreshSession()
      if (!refreshed && accessToken.value) {
        syncProfile(profile.value?.username ?? '')
      }
    } catch {
      logout()
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<TokenResponse>('/auth/token/', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(payload),
      })

      setSession(response, payload.username)
      return response
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Nao foi possivel entrar.'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null

    const endpoints = ['/users/api/auth/register/', '/usersapi/auth/register/']

    try {
      let lastError: unknown = null

      for (const endpoint of endpoints) {
        try {
          return await apiRequest<RegisterResponse>(endpoint, {
            method: 'POST',
            auth: false,
            body: JSON.stringify(payload),
          })
        } catch (err) {
          lastError = err
          if (!(err instanceof ApiError) || err.status !== 404) {
            throw err
          }
        }
      }

      throw lastError ?? new Error('Register endpoint not found')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Nao foi possivel criar a conta.'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    profile.value = null
    error.value = null
    initialized.value = true
    clearStoredTokens()
  }

  return {
    accessToken,
    refreshToken,
    profile,
    loading,
    error,
    initialized,
    isAuthenticated,
    displayName,
    roles,
    isUserGroup,
    bootstrap,
    login,
    register,
    refreshSession,
    logout,
  }
})
