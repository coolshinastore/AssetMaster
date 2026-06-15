export interface UserDto {
  id: number
  email: string
  displayName: string | null
  role: 'ROLE_USER' | 'ROLE_AUTHOR' | 'ROLE_ADMIN'
  avatarUrl: string | null
  bio: string | null
  verified: boolean
  emailVerified: boolean
  totpEnabled: boolean
  stripeConnected: boolean
  stripeOnboardingComplete: boolean
}

export type AuthResponse =
  | { requires2fa: false; accessToken: string; user: UserDto }
  | { requires2fa: true; partialToken: string; accessToken: null; user: null }

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  displayName: string
  password: string
}

export type LoginResult =
  | { requires2fa: false }
  | { requires2fa: true; partialToken: string }
