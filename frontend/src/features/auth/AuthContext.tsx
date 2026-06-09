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
import type { AuthResponse, LoginRequest, RegisterRequest, UserDto } from './types'

interface AuthContextValue {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }
    apiClient
      .get<UserDto>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    localStorage.setItem('accessToken', res.data.accessToken)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data)
    localStorage.setItem('accessToken', res.data.accessToken)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout').catch(() => null)
    localStorage.removeItem('accessToken')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
