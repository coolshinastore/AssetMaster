import client from '../../shared/api/client'
import type { AdminAssetDto, AdminUserDto, AdminStatsDto, PageResponse } from '../../entities/asset/types'

export const fetchAdminStats = (): Promise<AdminStatsDto> =>
  client.get('/admin/stats').then(r => r.data)

export const fetchPendingAssets = (page = 0, size = 20): Promise<PageResponse<AdminAssetDto>> =>
  client.get('/admin/assets/pending', { params: { page, size } }).then(r => r.data)

export const approveAsset = (id: number): Promise<void> =>
  client.put(`/admin/assets/${id}/approve`).then(() => undefined)

export const rejectAsset = (id: number, reason: string): Promise<void> =>
  client.put(`/admin/assets/${id}/reject`, { reason }).then(() => undefined)

export const fetchAdminUsers = (page = 0, size = 20): Promise<PageResponse<AdminUserDto>> =>
  client.get('/admin/users', { params: { page, size } }).then(r => r.data)

export const updateUserRole = (id: number, role: string): Promise<AdminUserDto> =>
  client.put(`/admin/users/${id}/role`, { role }).then(r => r.data)

export const verifyUser = (id: number, verified: boolean): Promise<AdminUserDto> =>
  client.put(`/admin/users/${id}/verify`, null, { params: { verified } }).then(r => r.data)
