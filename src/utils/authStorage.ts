import type { AuthTokens, AuthUser } from '../types/auth'
import { readJson, writeJson } from './storage'

const AUTH_TOKENS_KEY = 'auth.tokens'
const AUTH_USER_KEY = 'auth.user'

export function readAuthTokens(): AuthTokens | null {
  return readJson<AuthTokens | null>(AUTH_TOKENS_KEY, null)
}

export function writeAuthTokens(tokens: AuthTokens | null) {
  writeJson(AUTH_TOKENS_KEY, tokens)
}

export function readAuthUser(): AuthUser | null {
  return readJson<AuthUser | null>(AUTH_USER_KEY, null)
}

export function writeAuthUser(user: AuthUser | null) {
  writeJson(AUTH_USER_KEY, user)
}

