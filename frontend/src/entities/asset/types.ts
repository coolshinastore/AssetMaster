export interface AssetSummaryDto {
  id: number
  title: string
  thumbnailUrl: string | null
  authorId: number
  authorName: string | null
  authorAvatarUrl: string | null
  categoryId: number | null
  categoryName: string | null
  price: number
  licenseType: 'STANDARD' | 'COMMERCIAL'
  downloadsCount: number
  createdAt: string
}

export interface AssetDetailDto {
  id: number
  title: string
  description: string | null
  previewUrls: string[]
  authorId: number
  authorName: string | null
  authorAvatarUrl: string | null
  categoryId: number | null
  categoryName: string | null
  categorySlug: string | null
  price: number
  licenseType: 'STANDARD' | 'COMMERCIAL'
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  tags: string[] | null
  downloadsCount: number
  viewsCount: number
  createdAt: string
}

export interface CategoryDto {
  id: number
  name: string
  slug: string
  iconUrl: string | null
  parentId: number | null
  assetCount: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
  first: boolean
  size: number
}

export interface AuthorAssetDto {
  id: number
  title: string
  thumbnailUrl: string | null
  categoryId: number | null
  categoryName: string | null
  price: number
  licenseType: 'STANDARD' | 'COMMERCIAL'
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  tags: string[] | null
  downloadsCount: number
  viewsCount: number
  createdAt: string
}

export interface AdminAssetDto {
  id: number
  title: string
  description: string | null
  authorId: number
  authorEmail: string
  authorName: string | null
  categoryName: string | null
  price: number
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  rejectionReason: string | null
  previewUrls: string[]
  tags: string[] | null
  createdAt: string
}

export interface AdminUserDto {
  id: number
  email: string
  displayName: string | null
  role: 'ROLE_USER' | 'ROLE_AUTHOR' | 'ROLE_ADMIN'
  verified: boolean
  createdAt: string
}

export interface AdminStatsDto {
  totalUsers: number
  totalAssets: number
  pendingAssets: number
  publishedAssets: number
}

export interface ReviewDto {
  id: number
  authorId: number
  authorName: string | null
  authorAvatarUrl: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export interface AnalyticsSummaryDto {
  totalEarnings: number
  totalSales: number
  monthlySales: { month: string; salesCount: number; earnings: number }[]
  topAssets: { id: number; title: string; salesCount: number; earnings: number }[]
}

export interface AssetFilters {
  category?: number
  minPrice?: number
  maxPrice?: number
  license?: 'STANDARD' | 'COMMERCIAL'
  sort?: 'newest' | 'trending' | 'price_asc' | 'price_desc'
  page?: number
  size?: number
}
