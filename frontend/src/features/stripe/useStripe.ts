import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchStripeConnectStatus, startStripeOnboarding } from './stripeApi'

export function useStripeConnectStatus() {
  return useQuery({
    queryKey: ['stripe', 'connect-status'],
    queryFn: fetchStripeConnectStatus,
  })
}

export function useStartStripeOnboarding() {
  return useMutation({
    mutationFn: startStripeOnboarding,
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })
}
