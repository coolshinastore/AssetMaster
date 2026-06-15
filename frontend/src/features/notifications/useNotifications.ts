import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, fetchUnreadCount, markAllAsRead, markAsRead } from './notificationApi'

const KEYS = {
  list: ['notifications'] as const,
  unread: ['notifications', 'unread'] as const,
}

export function useNotifications() {
  return useQuery({ queryKey: KEYS.list, queryFn: fetchNotifications })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: KEYS.unread,
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list })
      qc.invalidateQueries({ queryKey: KEYS.unread })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list })
      qc.invalidateQueries({ queryKey: KEYS.unread })
    },
  })
}
