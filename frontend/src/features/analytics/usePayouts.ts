import { useQuery } from '@tanstack/react-query'
import { fetchMyPayouts } from './payoutsApi'

export function useMyPayouts() {
  return useQuery({ queryKey: ['payouts', 'mine'], queryFn: fetchMyPayouts })
}
