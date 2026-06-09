import apiClient from '../../../shared/api/client'
import type { CreateOrderRequest, DownloadUrlDto, OrderDetailDto } from '../types'

export const createOrder = (request: CreateOrderRequest): Promise<OrderDetailDto> =>
  apiClient.post('/orders', request).then(r => r.data)

export const fetchOrders = (): Promise<OrderDetailDto[]> =>
  apiClient.get('/orders').then(r => r.data)

export const fetchOrderById = (id: number): Promise<OrderDetailDto> =>
  apiClient.get(`/orders/${id}`).then(r => r.data)

export const fetchDownloadUrl = (orderId: number, assetId: number): Promise<DownloadUrlDto> =>
  apiClient.get(`/orders/${orderId}/download/${assetId}`).then(r => r.data)
