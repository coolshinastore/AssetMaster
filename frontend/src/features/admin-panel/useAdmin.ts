import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminStats,
  fetchPendingAssets,
  approveAsset,
  rejectAsset,
  fetchAdminUsers,
  updateUserRole,
} from './adminApi'

const adminKeys = {
  stats: ['admin', 'stats'] as const,
  pending: (page: number) => ['admin', 'pending', page] as const,
  users: (page: number) => ['admin', 'users', page] as const,
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
