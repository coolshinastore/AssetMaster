import apiClient from '../../shared/api/client'
import type { AssetSummaryDto } from '../../entities/asset/types'

export const fetchWishlist = (): Promise<AssetSummaryDto[]> =>
  apiClient.get('/wishlist').then(r => r.data)

export const addToWishlist = (assetId: number): Promise<void> =>
  apiClient.post(`/wishlist/${assetId}`).then(() => undefined)

export const removeFromWishlist = (assetId: number): Promise<void> =>
  apiClient.delete(`/wishlist/${assetId}`).then(() => undefined)
