export interface UserDto {
  id: number
  email: string
  displayName: string | null
  role: 'ROLE_USER' | 'ROLE_AUTHOR' | 'ROLE_ADMIN'
  avatarUrl: string | null
  verified: boolean
}

export interface AuthResponse {
  accessToken: string
  user: UserDto
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  displayName: string
  password: string
}
