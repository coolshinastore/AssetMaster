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

export interface AssetFilters {
  category?: number
  minPrice?: number
  maxPrice?: number
  license?: 'STANDARD' | 'COMMERCIAL'
  sort?: 'newest' | 'trending' | 'price_asc' | 'price_desc'
  page?: number
  size?: number
}
