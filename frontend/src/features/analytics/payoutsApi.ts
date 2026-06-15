import client from '../../shared/api/client'
import type { PayoutDto } from '../admin-panel/adminApi'

export const fetchMyPayouts = (): Promise<PayoutDto[]> =>
  client.get('/dashboard/payouts').then(r => r.data)
