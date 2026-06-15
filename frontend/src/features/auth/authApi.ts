import apiClient from '../../shared/api/client'
import type { UserDto } from './types'

export interface UpdateProfileRequest {
  displayName?: string
  avatarUrl?: string
  bio?: string
}

export const updateProfile = (data: UpdateProfileRequest) =>
  apiClient.patch<UserDto>('/auth/me', data)

export const uploadAvatar = (file: File): Promise<UserDto> => {
  const form = new FormData()
  form.append('file', file)
  return apiClient.post<UserDto>('/auth/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const forgotPassword = (email: string) =>
  apiClient.post('/auth/forgot-password', { email })

export const resetPassword = (token: string, newPassword: string) =>
  apiClient.post('/auth/reset-password', { token, newPassword })

export const verifyEmail = (token: string) =>
  apiClient.get('/auth/verify-email', { params: { token } })

export const resendVerification = () =>
  apiClient.post('/auth/verify-email/resend')

export const verify2fa = (partialToken: string, code: string) =>
  apiClient.post('/auth/2fa/verify', { partialToken, code })

export const setup2fa = () =>
  apiClient.get<{ secret: string; uri: string }>('/auth/2fa/setup')

export const enable2fa = (code: string) =>
  apiClient.post('/auth/2fa/enable', { code })

export const disable2fa = (code: string) =>
  apiClient.post('/auth/2fa/disable', { code })
