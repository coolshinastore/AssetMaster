import client from '../../../shared/api/client'
import type { AssetSummaryDto, AssetDetailDto, CategoryDto, PageResponse, AssetFilters } from '../types'

export async function fetchAssets(filters: AssetFilters = {}): Promise<PageResponse<AssetSummaryDto>> {
  const { data } = await client.get<PageResponse<AssetSummaryDto>>('/assets', {
    params: {
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      license: filters.license,
      sort: filters.sort,
      page: filters.page ?? 0,
      size: filters.size ?? 20,
    },
  })
  return data
}

export async function fetchTrendingAssets(limit = 8): Promise<AssetSummaryDto[]> {
  const { data } = await client.get<AssetSummaryDto[]>('/assets/trending', { params: { limit } })
  return data
}

export async function fetchNewAssets(limit = 8): Promise<AssetSummaryDto[]> {
  const { data } = await client.get<AssetSummaryDto[]>('/assets/new', { params: { limit } })
  return data
}

export async function fetchAssetById(id: number): Promise<AssetDetailDto> {
  const { data } = await client.get<AssetDetailDto>(`/assets/${id}`)
  return data
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  const { data } = await client.get<CategoryDto[]>('/categories')
  return data
}

export async function searchAssets(q: string, page = 0, size = 20): Promise<PageResponse<AssetSummaryDto>> {
  const { data } = await client.get<PageResponse<AssetSummaryDto>>('/assets/search', {
    params: { q, page, size },
  })
  return data
}
