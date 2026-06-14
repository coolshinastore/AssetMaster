import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchReviews, fetchReviewStats, createReview } from './reviewApi'

export const reviewKeys = {
  list:  (assetId: number, page: number) => ['reviews', assetId, page] as const,
  stats: (assetId: number)               => ['reviews', assetId, 'stats'] as const,
}

export function useReviews(assetId: number, page = 0) {
  return useQuery({
    queryKey: reviewKeys.list(assetId, page),
    queryFn: () => fetchReviews(assetId, page),
    enabled: assetId > 0,
  })
}

export function useReviewStats(assetId: number) {
  return useQuery({
    queryKey: reviewKeys.stats(assetId),
    queryFn: () => fetchReviewStats(assetId),
    enabled: assetId > 0,
  })
}

export function useCreateReview(assetId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      createReview(assetId, rating, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', assetId] }), // інвалідує list + stats
  })
}
