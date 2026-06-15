import client from '../../shared/api/client'
import type { AdminAssetDto, AdminUserDto, AdminStatsDto, PageResponse } from '../../entities/asset/types'

export interface CategoryDto {
  id: number
  name: string
  slug: string
  iconUrl: string | null
  parentId: number | null
  assetCount: number
}

export interface UpsertCategoryRequest {
  name: string
  slug: string
  parentId: number | null
  iconUrl: string | null
}

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

export interface AdminFinanceSummaryDto {
  totalRevenue: number
  monthRevenue: number
  totalOrders: number
  monthly: { month: string; orders: number; revenue: number }[]
  topAuthors: { authorId: number; displayName: string; sales: number; earnings: number }[]
}

export interface AdminPlatformAnalyticsDto {
  totalUsers: number
  totalAssets: number
  publishedAssets: number
  totalOrders: number
  totalRevenue: number
  monthly: { month: string; newUsers: number; orders: number; revenue: number }[]
  topCategories: { name: string; assetCount: number }[]
}

export const fetchAdminFinance = (): Promise<AdminFinanceSummaryDto> =>
  client.get('/admin/finance').then(r => r.data)

export const fetchAdminPlatformAnalytics = (): Promise<AdminPlatformAnalyticsDto> =>
  client.get('/admin/analytics').then(r => r.data)

export interface PayoutDto {
  id: number
  authorId: number
  authorName: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'
  periodStart: string
  periodEnd: string
  processedAt: string | null
  notes: string | null
  stripeTransferId: string | null
  createdAt: string
}

export interface TriggerPayoutRequest {
  authorId: number
  amount: number
  periodStart: string
  periodEnd: string
  notes?: string
}

export const fetchAdminPayouts = (page = 0, size = 20): Promise<PageResponse<PayoutDto>> =>
  client.get('/admin/finance/payouts', { params: { page, size } }).then(r => r.data)

export const triggerPayout = (req: TriggerPayoutRequest): Promise<PayoutDto> =>
  client.post('/admin/finance/payouts', req).then(r => r.data)

export const updatePayoutStatus = (id: number, status: string): Promise<PayoutDto> =>
  client.put(`/admin/finance/payouts/${id}/status`, null, { params: { status } }).then(r => r.data)

export const executeStripeTransfer = (id: number): Promise<PayoutDto> =>
  client.post(`/admin/finance/payouts/${id}/transfer`).then(r => r.data)

export const fetchAdminCategories = (): Promise<CategoryDto[]> =>
  client.get('/admin/categories').then(r => r.data)

export const createCategory = (req: UpsertCategoryRequest): Promise<CategoryDto> =>
  client.post('/admin/categories', req).then(r => r.data)

export const updateCategory = (id: number, req: UpsertCategoryRequest): Promise<CategoryDto> =>
  client.put(`/admin/categories/${id}`, req).then(r => r.data)

export const deleteCategory = (id: number): Promise<void> =>
  client.delete(`/admin/categories/${id}`).then(() => undefined)

// ── Blog ──────────────────────────────────────────────────────────

export interface AdminBlogPostDto {
  id: number
  slug: string
  tag: string | null
  title: string
  excerpt: string | null
  content: string
  published: boolean
  readTime: string | null
  authorName: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBlogPostRequest {
  slug: string
  tag: string
  title: string
  excerpt: string
  content: string
  published: boolean
  readTime: string
}

export const fetchAdminBlogPosts = (page = 0, size = 20): Promise<PageResponse<AdminBlogPostDto>> =>
  client.get('/admin/blog', { params: { page, size } }).then(r => r.data)

export const createBlogPost = (req: CreateBlogPostRequest): Promise<AdminBlogPostDto> =>
  client.post('/admin/blog', req).then(r => r.data)

export const updateBlogPost = (id: number, req: CreateBlogPostRequest): Promise<AdminBlogPostDto> =>
  client.put(`/admin/blog/${id}`, req).then(r => r.data)

export const deleteBlogPost = (id: number): Promise<void> =>
  client.delete(`/admin/blog/${id}`).then(() => undefined)
