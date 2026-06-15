import client from '../../shared/api/client'

export interface NotificationDto {
  id: number
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  createdAt: string
}

export const fetchNotifications = () =>
  client.get<NotificationDto[]>('/notifications').then(r => r.data)

export const fetchUnreadCount = () =>
  client.get<{ count: number }>('/notifications/unread-count').then(r => r.data)

export const markAsRead = (id: number) =>
  client.patch(`/notifications/${id}/read`)

export const markAllAsRead = () =>
  client.patch('/notifications/read-all')
