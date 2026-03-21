import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../services/authApi'
import type { AuthTokens, AuthUser } from '../types/auth'
import {
  readAuthTokens,
  readAuthUser,
  writeAuthTokens,
  writeAuthUser,
} from '../utils/authStorage'

type AuthContextValue = {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: { fullName: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readAuthUser())
  const [tokens, setTokens] = useState<AuthTokens | null>(() => readAuthTokens())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!tokens?.accessToken) {
        if (!cancelled) setIsLoading(false)
        return
      }
      try {
        const me = await authApi.getMe(tokens.accessToken)
        if (!cancelled) {
          setUser(me)
          writeAuthUser(me)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setTokens(null)
          writeAuthUser(null)
          writeAuthTokens(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tokens?.accessToken])

  async function login(input: { email: string; password: string }) {
    const res = await authApi.login(input)
    setUser(res.user)
    setTokens(res.tokens)
    writeAuthUser(res.user)
    writeAuthTokens(res.tokens)
  }

  async function register(input: { fullName: string; email: string; password: string }) {
    const res = await authApi.register(input)
    setUser(res.user)
    setTokens(res.tokens)
    writeAuthUser(res.user)
    writeAuthTokens(res.tokens)
  }

  function logout() {
    setUser(null)
    setTokens(null)
    writeAuthUser(null)
    writeAuthTokens(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: !!user && !!tokens?.accessToken,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, tokens, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

