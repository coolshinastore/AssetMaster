import client from '../../shared/api/client'

export interface StripeConnectStatus {
  enabled: boolean
  connected: boolean
  onboardingComplete: boolean
}

export const fetchStripeConnectStatus = (): Promise<StripeConnectStatus> =>
  client.get('/stripe/connect/status').then(r => r.data)

export const startStripeOnboarding = (): Promise<{ url: string }> =>
  client.post('/stripe/connect/onboard').then(r => r.data)
