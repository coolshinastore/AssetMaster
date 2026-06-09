import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWishlist, addToWishlist, removeFromWishlist } from './wishlistApi'
import { useAuth } from '../auth/AuthContext'

export const wishlistKeys = {
  all: ['wishlist'] as const,
}

export function useWishlist() {
  const { user } = useAuth()
  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: fetchWishlist,
    enabled: !!user,
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  const { data: wishlist } = useWishlist()

  const addMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
  })

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
  })

  const toggle = (assetId: number) => {
    if (wishlist?.some(a => a.id === assetId)) {
      removeMutation.mutate(assetId)
    } else {
      addMutation.mutate(assetId)
    }
  }

  const isInWishlist = (assetId: number) => wishlist?.some(a => a.id === assetId) ?? false

  return {
    toggle,
    isInWishlist,
    isPending: addMutation.isPending || removeMutation.isPending,
  }
}
