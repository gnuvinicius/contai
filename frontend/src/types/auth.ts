export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
}

export interface AuthResponse {
  access: string
  refresh?: string
  user: User
}
