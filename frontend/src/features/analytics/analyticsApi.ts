import client from '../../shared/api/client'
import type { AnalyticsSummaryDto } from '../../entities/asset/types'

export const fetchAnalytics = (): Promise<AnalyticsSummaryDto> =>
  client.get('/dashboard/analytics').then(r => r.data)
