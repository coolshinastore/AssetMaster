import client from '../../shared/api/client'
import type { ReviewDto, PageResponse } from '../../entities/asset/types'

export const fetchReviews = (assetId: number, page = 0, size = 10): Promise<PageResponse<ReviewDto>> =>
  client.get(`/assets/${assetId}/reviews`, { params: { page, size } }).then(r => r.data)

export const createReview = (assetId: number, rating: number, comment: string): Promise<ReviewDto> =>
  client.post(`/assets/${assetId}/reviews`, { rating, comment }).then(r => r.data)
