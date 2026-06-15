import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminStats,
  fetchPendingAssets,
  approveAsset,
  rejectAsset,
  fetchAdminUsers,
  updateUserRole,
  verifyUser,
  fetchAdminFinance,
  fetchAdminPlatformAnalytics,
  fetchAdminPayouts,
  triggerPayout,
  updatePayoutStatus,
  executeStripeTransfer,
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type UpsertCategoryRequest,
  type TriggerPayoutRequest,
  type CreateBlogPostRequest,
} from './adminApi'

const adminKeys = {
  stats: ['admin', 'stats'] as const,
  pending: (page: number) => ['admin', 'pending', page] as const,
  users: (page: number) => ['admin', 'users', page] as const,
  finance: ['admin', 'finance'] as const,
  platformAnalytics: ['admin', 'platform-analytics'] as const,
  categories: ['admin', 'categories'] as const,
  blog: (page: number) => ['admin', 'blog', page] as const,
}

export function useAdminStats() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: fetchAdminStats })
}

export function usePendingAssets(page: number) {
  return useQuery({
    queryKey: adminKeys.pending(page),
    queryFn: () => fetchPendingAssets(page),
  })
}

export function useApproveAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: approveAsset,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending'] }),
  })
}

export function useRejectAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectAsset(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending'] }),
  })
}

export function useAdminUsers(page: number) {
  return useQuery({
    queryKey: adminKeys.users(page),
    queryFn: () => fetchAdminUsers(page),
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useVerifyUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, verified }: { id: number; verified: boolean }) => verifyUser(id, verified),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminFinance() {
  return useQuery({ queryKey: adminKeys.finance, queryFn: fetchAdminFinance })
}

export function useAdminPayouts(page = 0) {
  return useQuery({
    queryKey: [...adminKeys.finance, 'payouts', page] as const,
    queryFn: () => fetchAdminPayouts(page),
  })
}

export function useTriggerPayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: TriggerPayoutRequest) => triggerPayout(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.finance }),
  })
}

export function useUpdatePayoutStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updatePayoutStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.finance }),
  })
}

export function useExecuteStripeTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => executeStripeTransfer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.finance }),
  })
}

export function useAdminPlatformAnalytics() {
  return useQuery({ queryKey: adminKeys.platformAnalytics, queryFn: fetchAdminPlatformAnalytics })
}

export function useAdminCategories() {
  return useQuery({ queryKey: adminKeys.categories, queryFn: fetchAdminCategories })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: UpsertCategoryRequest) => createCategory(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.categories }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpsertCategoryRequest }) => updateCategory(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.categories }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.categories }),
  })
}

export function useAdminBlogPosts(page = 0) {
  return useQuery({
    queryKey: adminKeys.blog(page),
    queryFn: () => fetchAdminBlogPosts(page),
  })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateBlogPostRequest) => createBlogPost(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'blog'] }),
  })
}

export function useUpdateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CreateBlogPostRequest }) => updateBlogPost(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'blog'] }),
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBlogPost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'blog'] }),
  })
}
