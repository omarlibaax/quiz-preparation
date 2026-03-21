export type AuthUser = {
  id: number
  fullName: string
  email: string
  role: 'ADMIN' | 'STUDENT'
  status?: 'ACTIVE' | 'SUSPENDED'
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthResponse = {
  user: AuthUser
  tokens: AuthTokens
}

