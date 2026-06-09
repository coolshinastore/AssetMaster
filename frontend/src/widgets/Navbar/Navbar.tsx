import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../features/auth/AuthContext'
import { useCart } from '../../features/cart/CartContext'
import { useWishlist } from '../../features/wishlist/useWishlist'
import SearchBar from '../../features/search/SearchBar'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { itemCount: cartCount } = useCart()
  const { data: wishlistItems } = useWishlist()
  const wishlistCount = wishlistItems?.length ?? 0

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget)
  const handleMenuClose = () => setMenuAnchor(null)

  const handleNavigate = (path: string) => {
    handleMenuClose()
    navigate(path)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
    navigate('/')
  }

  return (
    <AppBar component="nav" position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 2, px: { xs: 2, md: 4 }, minHeight: { xs: 56, md: 64 } }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexShrink: 0 }}
        >
          <Box
            sx={{
              width: 34, height: 34,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1A1F3C 100%)',
            }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'text.primary',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            AssetMaster
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ flex: 1, maxWidth: 480 }}>
          <SearchBar />
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
          {isAuthenticated && (
            <IconButton size="small" onClick={() => navigate('/dashboard/wishlist')} title="Список бажань">
              <Badge badgeContent={wishlistCount || undefined} color="error" max={99}>
                <FavoriteBorderIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          )}

          <IconButton size="small" onClick={() => navigate('/cart')} title="Кошик">
            <Badge badgeContent={cartCount || undefined} color="primary" max={99}>
              <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                title="Мій акаунт"
                sx={{ ml: 0.5 }}
                aria-controls={menuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <Avatar
                  src={user?.avatarUrl ?? undefined}
                  sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
                >
                  {user?.displayName?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                id="user-menu"
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={handleMenuClose}
                slotProps={{ paper: { elevation: 4, sx: { mt: 1, minWidth: 200, borderRadius: 3, border: '1px solid #e5e8f0' } } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {user?.displayName ?? user?.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />

                <MenuItem onClick={() => handleNavigate('/dashboard/purchases')}>
                  <ListItemIcon><ShoppingBagOutlinedIcon fontSize="small" /></ListItemIcon>
                  Мої покупки
                </MenuItem>

                {user?.role === 'ROLE_AUTHOR' && (
                  <MenuItem onClick={() => handleNavigate('/dashboard/assets')}>
                    <ListItemIcon><ImageOutlinedIcon fontSize="small" /></ListItemIcon>
                    Мої активи
                  </MenuItem>
                )}

                {user?.role === 'ROLE_AUTHOR' && (
                  <MenuItem onClick={() => handleNavigate('/dashboard/analytics')}>
                    <ListItemIcon><DashboardOutlinedIcon fontSize="small" /></ListItemIcon>
                    Аналітика
                  </MenuItem>
                )}

                {user?.role === 'ROLE_ADMIN' && (
                  <MenuItem onClick={() => handleNavigate('/admin')}>
                    <ListItemIcon><AdminPanelSettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                    Адмін панель
                  </MenuItem>
                )}

                <MenuItem onClick={() => handleNavigate('/dashboard/profile')}>
                  <ListItemIcon><PersonOutlinedIcon fontSize="small" /></ListItemIcon>
                  Профіль
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                  Вийти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/auth/login"
                size="small"
                sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Увійти
              </Button>
              <Button
                component={Link}
                to="/auth/register"
                variant="contained"
                size="small"
                sx={{ ml: 1 }}
              >
                Реєстрація
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
