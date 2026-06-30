import { http } from '@/api/http'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('auth/token/', payload)
    return data
  },
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('usersapi/auth/register/', payload)
    return data
  },
}
