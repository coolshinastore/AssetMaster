import { NavLink, Outlet } from 'react-router-dom'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import Navbar from '../Navbar/Navbar'
import { useAuth } from '../../features/auth/AuthContext'
import { useUnreadCount } from '../../features/notifications/useNotifications'

const SIDEBAR_WIDTH = 240

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  end?: boolean
  badge?: number
}

function useCommonItems(): NavItem[] {
  const { data: unread } = useUnreadCount()
  return [
    { label: 'Профіль',            to: '/dashboard/profile',        icon: <PersonOutlinedIcon fontSize="small" /> },
    { label: 'Мої покупки',        to: '/dashboard/purchases',      icon: <ShoppingBagOutlinedIcon fontSize="small" /> },
    { label: 'Список бажань',      to: '/dashboard/wishlist',       icon: <FavoriteBorderIcon fontSize="small" /> },
    { label: 'Сповіщення',         to: '/dashboard/notifications',  icon: <NotificationsNoneOutlinedIcon fontSize="small" />, badge: unread?.count },
    { label: 'Платіжні реквізити', to: '/dashboard/payments',       icon: <CreditCardOutlinedIcon fontSize="small" /> },
    { label: 'Безпека',            to: '/dashboard/security',       icon: <SecurityOutlinedIcon fontSize="small" /> },
  ]
}

const authorItems: NavItem[] = [
  { label: 'Мої активи',        to: '/dashboard/assets',     icon: <ImageOutlinedIcon fontSize="small" />,       end: true },
  { label: 'Завантажити актив', to: '/dashboard/assets/new', icon: <AddCircleOutlineIcon fontSize="small" /> },
  { label: 'Аналітика',         to: '/dashboard/analytics',  icon: <BarChartOutlinedIcon fontSize="small" /> },
]

const adminItems: NavItem[] = [
  { label: 'Дашборд',      to: '/admin',              icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />, end: true },
  { label: 'Модерація',    to: '/admin/moderation',   icon: <GavelOutlinedIcon fontSize="small" /> },
  { label: 'Користувачі',  to: '/admin/users',        icon: <PeopleOutlinedIcon fontSize="small" /> },
  { label: 'Фінанси',      to: '/admin/finance',      icon: <PaidOutlinedIcon fontSize="small" /> },
  { label: 'Аналітика',    to: '/admin/analytics',    icon: <AnalyticsOutlinedIcon fontSize="small" /> },
  { label: 'Категорії',    to: '/admin/categories',   icon: <CategoryOutlinedIcon fontSize="small" /> },
  { label: 'Блог',         to: '/admin/blog',         icon: <ArticleOutlinedIcon fontSize="small" /> },
]

function SidebarSection({ title, items }: { title?: string; items: NavItem[] }) {
  return (
    <>
      {title && (
        <Typography
          variant="caption"
          sx={{ px: 2, pt: 2, pb: 0.5, display: 'block', fontWeight: 700, color: 'text.disabled', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {title}
        </Typography>
      )}
      <List disablePadding sx={{ px: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            sx={{
              borderRadius: 2,
              mb: 0.25,
              minHeight: 40,
              '&.active': {
                bgcolor: 'primary.light',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
              '&:not(.active):hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="primary" max={99}>
                  {item.icon}
                </Badge>
              ) : item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}

export default function DashboardLayout() {
  const { user } = useAuth()
  const commonItems = useCommonItems()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar — desktop only */}
        <Box
          component="aside"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            py: 1,
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          <SidebarSection items={commonItems} />

          {user?.role === 'ROLE_AUTHOR' && (
            <>
              <Divider sx={{ my: 1 }} />
              <SidebarSection title="Автор" items={authorItems} />
            </>
          )}

          {user?.role === 'ROLE_ADMIN' && (
            <>
              <Divider sx={{ my: 1 }} />
              <SidebarSection title="Адміністрування" items={adminItems} />
            </>
          )}
        </Box>

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
