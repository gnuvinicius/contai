import axios, { AxiosError } from 'axios'

import router from '@/router'
import { tokenStorage } from '@/utils/storage'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
      tokenStorage.clear()
      if (router.currentRoute.value.path !== '/login') {
        router.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)
