import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  type AssetFormData,
} from './authorAssetApi'

export const authorAssetKeys = {
  mine: ['author-assets'] as const,
}

export function useMyAssets() {
  return useQuery({
    queryKey: authorAssetKeys.mine,
    queryFn: fetchMyAssets,
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AssetFormData) => createAsset(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authorAssetKeys.mine }),
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssetFormData> }) =>
      updateAsset(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authorAssetKeys.mine }),
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAsset(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authorAssetKeys.mine }),
  })
}
