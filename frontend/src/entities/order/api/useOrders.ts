import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder, fetchOrders, fetchOrderById } from './orderApi'
import type { CreateOrderRequest } from '../types'

export const orderKeys = {
  all:    ['orders'] as const,
  detail: (id: number) => ['orders', id] as const,
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn:  fetchOrders,
  })
}

export function useOrderDetail(id: number | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id!),
    queryFn:  () => fetchOrderById(id!),
    enabled:  !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateOrderRequest) => createOrder(request),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
