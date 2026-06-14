import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import apiClient from '../../shared/api/client'
import * as authApi from './authApi'
import type { AuthResponse, LoginRequest, LoginResult, RegisterRequest, UserDto } from './types'

interface AuthContextValue {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<LoginResult>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  verify2fa: (partialToken: string, code: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    try {
      const res = await apiClient.get<UserDto>('/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem('accessToken')
    }
  }, [])

  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false))
  }, [fetchMe])

  const login = useCallback(async (data: LoginRequest): Promise<LoginResult> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    if (res.data.requires2fa) {
      return { requires2fa: true, partialToken: res.data.partialToken }
    }
    localStorage.setItem('accessToken', res.data.accessToken)
    setUser(res.data.user)
    return { requires2fa: false }
  }, [])

  const verify2fa = useCallback(async (partialToken: string, code: string) => {
    const res = await authApi.verify2fa(partialToken, code)
    const body = res.data as AuthResponse
    if (!body.requires2fa) {
      localStorage.setItem('accessToken', body.accessToken)
      setUser(body.user)
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data)
    if (!res.data.requires2fa) {
      localStorage.setItem('accessToken', res.data.accessToken)
      setUser(res.data.user)
    }
  }, [])

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout').catch(() => null)
    localStorage.removeItem('accessToken')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await apiClient.get<UserDto>('/auth/me')
    setUser(res.data)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout, verify2fa, refreshUser }),
    [user, isLoading, login, register, logout, verify2fa, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
