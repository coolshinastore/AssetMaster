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
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../features/auth/AuthContext'
import { useCart } from '../../features/cart/CartContext'
import { useWishlist } from '../../features/wishlist/useWishlist'
import SearchBar from '../../features/search/SearchBar'

const NAV_CATS = [
  { label: 'Explore', href: '/catalog', chevron: true },
  { label: 'Trending', href: '/catalog?sort=trending', chevron: false },
  { label: 'Sell', href: '/dashboard/assets/new', chevron: false },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { itemCount: cartCount } = useCart()
  const { data: wishlistItems } = useWishlist()
  const wishlistCount = wishlistItems?.length ?? 0

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  const handleMenuOpen  = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget)
  const handleMenuClose = () => setMenuAnchor(null)
  const handleNavigate  = (path: string) => { handleMenuClose(); navigate(path) }
  const handleLogout    = async () => { handleMenuClose(); await logout(); navigate('/') }

  return (
    <AppBar component="nav" position="sticky" elevation={0}>
      <Toolbar sx={{ gap: { xs: 1, md: 2.5 }, px: { xs: 2, md: 3 }, minHeight: '72px !important' }}>

        {/* ── Logo ── */}
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
        >
          <Box
            sx={{
              width: 34, height: 34, borderRadius: '9px',
              background: 'linear-gradient(135deg, #3B82F6, #1A1F3C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 2px 6px rgba(26,31,60,0.07)',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" width="19" height="19">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="m3 7 9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700, fontSize: '20px', letterSpacing: '-0.03em',
              color: 'text.primary',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            AssetMaster
          </Typography>
        </Box>

        {/* ── Nav-cat links (hidden ≤1080px) ── */}
        <Box
          component="nav"
          aria-label="Категорії"
          sx={{ display: { xs: 'none', lg: 'flex' }, gap: '2px', flexShrink: 0 }}
        >
          {NAV_CATS.map(({ label, href, chevron }) => (
            <Box
              key={label}
              component={Link}
              to={href}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                px: '12px', py: '9px', borderRadius: '8px',
                fontWeight: 500, fontSize: '14.5px', color: 'text.secondary',
                textDecoration: 'none',
                transition: 'background 0.14s, color 0.14s',
                '&:hover': { bgcolor: '#f1f3f9', color: 'text.primary' },
              }}
            >
              {label}
              {chevron && <KeyboardArrowDownIcon sx={{ fontSize: 15, opacity: 0.6 }} />}
            </Box>
          ))}
        </Box>

        {/* ── Search ── */}
        <Box sx={{ flex: 1, maxWidth: '520px' }}>
          <SearchBar />
        </Box>

        {/* ── Right actions ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
          {isAuthenticated && (
            <IconButton
              size="small"
              onClick={() => navigate('/dashboard/wishlist')}
              aria-label={`Список бажань (${wishlistCount})`}
              sx={{
                width: 44, height: 44, borderRadius: '12px',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              <Badge badgeContent={wishlistCount || undefined} color="primary" max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: '11px', fontWeight: 700, minWidth: 18, height: 18, border: '2px solid #fff' } }}
              >
                <FavoriteBorderIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          )}

          <IconButton
            size="small"
            onClick={() => navigate('/cart')}
            aria-label={`Кошик (${cartCount})`}
            sx={{ width: 44, height: 44, borderRadius: '12px' }}
          >
            <Badge badgeContent={cartCount || undefined} color="primary" max={99}
              sx={{ '& .MuiBadge-badge': { fontSize: '11px', fontWeight: 700, minWidth: 18, height: 18, border: '2px solid #fff' } }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <Box sx={{ width: '1px', height: '26px', bgcolor: '#e5e8f0', mx: '4px' }} aria-hidden="true" />

              <IconButton
                onClick={handleMenuOpen}
                aria-label="Профіль"
                aria-controls={menuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={user?.avatarUrl ?? undefined}
                  sx={{
                    width: 38, height: 38,
                    background: 'linear-gradient(135deg, #5b9bff, #1A1F3C)',
                    fontSize: '14px', fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
                    border: '2px solid #fff',
                    boxShadow: '0 1px 2px rgba(26,31,60,0.06)',
                    transition: 'box-shadow 0.16s',
                    '&:hover': { boxShadow: '0 0 0 3px rgba(59,130,246,0.35)' },
                  }}
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
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
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

                <MenuItem onClick={() => handleNavigate('/dashboard/security')}>
                  <ListItemIcon><SecurityOutlinedIcon fontSize="small" /></ListItemIcon>
                  Безпека
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
                sx={{ ml: 0.5 }}
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
