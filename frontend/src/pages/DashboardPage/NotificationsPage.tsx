import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '../../features/notifications/useNotifications'
import type { NotificationDto } from '../../features/notifications/notificationApi'

const TYPE_LABELS: Record<string, { label: string; color: 'success' | 'info' | 'warning' | 'default' }> = {
  ASSET_APPROVED: { label: 'Схвалено',   color: 'success' },
  ASSET_REJECTED: { label: 'Відхилено',  color: 'warning' },
  ORDER_PLACED:   { label: 'Покупка',    color: 'info' },
  NEW_REVIEW:     { label: 'Відгук',     color: 'info' },
  SYSTEM:         { label: 'Система',    color: 'default' },
}

function NotificationItem({ n, onMarkRead }: { n: NotificationDto; onMarkRead: (id: number) => void }) {
  const meta = TYPE_LABELS[n.type] ?? { label: n.type, color: 'default' as const }
  const date = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(n.createdAt))

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        px: 3,
        py: 2,
        bgcolor: n.read ? 'transparent' : 'primary.light',
        borderLeft: n.read ? 'none' : '3px solid',
        borderColor: 'primary.main',
        transition: 'background-color 0.2s',
      }}
      secondaryAction={
        !n.read && (
          <Tooltip title="Позначити прочитаним">
            <IconButton size="small" onClick={() => onMarkRead(n.id)}>
              <CheckCircleOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Chip label={meta.label} color={meta.color} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
              {n.title}
            </Typography>
          </Box>
        }
        secondary={
          <>
            {n.body && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {n.body}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.disabled">{date}</Typography>
              {n.link && (
                <Typography
                  component={Link}
                  to={n.link}
                  variant="caption"
                  color="primary"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Перейти →
                </Typography>
              )}
            </Box>
          </>
        }
      />
    </ListItem>
  )
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkAsRead()
  const markAll = useMarkAllAsRead()

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h2">Сповіщення</Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {unreadCount} непрочитаних
            </Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            startIcon={<DoneAllIcon />}
            variant="outlined"
            size="small"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            Читати всі
          </Button>
        )}
      </Box>

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
        {isLoading && (
          Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ px: 3, py: 2 }}>
              <Skeleton width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton width="70%" height={16} />
              <Skeleton width="40%" height={16} />
            </Box>
          ))
        )}

        {!isLoading && (!notifications || notifications.length === 0) && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">У вас немає сповіщень</Typography>
          </Box>
        )}

        {!isLoading && notifications && notifications.length > 0 && (
          <List disablePadding>
            {notifications.map((n, i) => (
              <>
                <NotificationItem key={n.id} n={n} onMarkRead={id => markRead.mutate(id)} />
                {i < notifications.length - 1 && <Divider key={`d-${n.id}`} />}
              </>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}
