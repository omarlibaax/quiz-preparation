import type { AuthResponse, AuthUser } from '../types/auth'
import { apiGet, apiPost } from './apiClient'

type RegisterInput = {
  fullName: string
  email: string
  password: string
}

type LoginInput = {
  email: string
  password: string
}

export function register(input: RegisterInput) {
  return apiPost<AuthResponse, RegisterInput>('/api/auth/register', input)
}

export function login(input: LoginInput) {
  return apiPost<AuthResponse, LoginInput>('/api/auth/login', input)
}

export function getMe(accessToken: string) {
  return apiGet<AuthUser>('/api/auth/me', { accessToken })
}

