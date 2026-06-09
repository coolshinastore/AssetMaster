import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchAssets,
  fetchTrendingAssets,
  fetchNewAssets,
  fetchAssetById,
  fetchCategories,
  searchAssets,
} from './assetApi'
import type { AssetFilters } from '../types'

export const assetKeys = {
  trending: (limit: number) => ['assets', 'trending', limit] as const,
  newList:  (limit: number) => ['assets', 'new', limit] as const,
  detail:   (id: number)    => ['assets', 'detail', id] as const,
  list:     (f: AssetFilters) => ['assets', 'list', f] as const,
  search:   (q: string)     => ['assets', 'search', q] as const,
}

export function useTrendingAssets(limit = 8) {
  return useQuery({
    queryKey: assetKeys.trending(limit),
    queryFn:  () => fetchTrendingAssets(limit),
  })
}

export function useNewAssets(limit = 8) {
  return useQuery({
    queryKey: assetKeys.newList(limit),
    queryFn:  () => fetchNewAssets(limit),
  })
}

export function useAssetDetail(id: number) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn:  () => fetchAssetById(id),
    enabled:  !!id && !isNaN(id),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 10 * 60 * 1000,
  })
}

export function useInfiniteAssets(filters: Omit<AssetFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: assetKeys.list(filters),
    queryFn:  ({ pageParam }) => fetchAssets({ ...filters, page: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  })
}

export function useSearchInfinite(q: string) {
  return useInfiniteQuery({
    queryKey: assetKeys.search(q),
    queryFn:  ({ pageParam }) => searchAssets(q, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    enabled:  q.trim().length > 1,
  })
}
