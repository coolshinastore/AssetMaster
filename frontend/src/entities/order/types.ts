export interface OrderItemDto {
  assetId: number
  assetTitle: string
  thumbnailUrl: string | null
  authorName: string | null
  priceAtPurchase: number
  licenseType: 'STANDARD' | 'COMMERCIAL'
}

export interface OrderDetailDto {
  id: number
  totalAmount: number
  status: 'PENDING' | 'PAID' | 'REFUNDED'
  items: OrderItemDto[]
  createdAt: string
}

export interface CreateOrderRequest {
  items: { assetId: number; licenseType: string }[]
}

export interface DownloadUrlDto {
  url: string
  expiresAt: string
}
