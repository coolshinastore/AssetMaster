import { useQuery } from '@tanstack/react-query'
import { fetchAnalytics } from './analyticsApi'

export function useAnalytics() {
  return useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: fetchAnalytics,
  })
}
