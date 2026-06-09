import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../shared/components/ProtectedRoute'

const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────
  {
    path: '/',
    lazy: () => import('../pages/HomePage/HomePage').then(m => ({ Component: m.default })),
  },
  {
    path: '/catalog',
    lazy: () => import('../pages/CatalogPage/CatalogPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/catalog/:categorySlug',
    lazy: () => import('../pages/CatalogPage/CatalogPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/assets/:id',
    lazy: () => import('../pages/AssetPage/AssetPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/search',
    lazy: () => import('../pages/CatalogPage/CatalogPage').then(m => ({ Component: m.default })),
  },

  // ── Auth ────────────────────────────────────────────────────
  {
    path: '/auth/login',
    lazy: () => import('../pages/auth/LoginPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/auth/register',
    lazy: () => import('../pages/auth/RegisterPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/auth/reset-password',
    lazy: () => import('../pages/auth/ResetPasswordPage').then(m => ({ Component: m.default })),
  },

  // ── Buyer dashboard ─────────────────────────────────────────
  {
    path: '/cart',
    lazy: () => import('../pages/CartPage/CartPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/checkout',
    element: <ProtectedRoute><div /></ProtectedRoute>,
    lazy: () => import('../pages/CheckoutPage/CheckoutPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/checkout/success',
    element: <ProtectedRoute><div /></ProtectedRoute>,
    lazy: () => import('../pages/CheckoutPage/CheckoutSuccessPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/dashboard/purchases',
    element: <ProtectedRoute><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/PurchasesPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/dashboard/wishlist',
    element: <ProtectedRoute><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/WishlistPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/dashboard/profile',
    element: <ProtectedRoute><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/ProfilePage').then(m => ({ Component: m.default })),
  },

  // ── Author dashboard ─────────────────────────────────────────
  {
    path: '/dashboard/assets',
    element: <ProtectedRoute requiredRole="ROLE_AUTHOR"><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/AssetsPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/dashboard/assets/new',
    element: <ProtectedRoute requiredRole="ROLE_AUTHOR"><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/AssetUploadPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/dashboard/assets/:id/edit',
    element: <ProtectedRoute requiredRole="ROLE_AUTHOR"><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/AssetEditPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/dashboard/analytics',
    element: <ProtectedRoute requiredRole="ROLE_AUTHOR"><div /></ProtectedRoute>,
    lazy: () => import('../pages/DashboardPage/AnalyticsPage').then(m => ({ Component: m.default })),
  },

  // ── Admin ────────────────────────────────────────────────────
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="ROLE_ADMIN"><div /></ProtectedRoute>,
    lazy: () => import('../pages/AdminPage/AdminDashboardPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/admin/moderation',
    element: <ProtectedRoute requiredRole="ROLE_ADMIN"><div /></ProtectedRoute>,
    lazy: () => import('../pages/AdminPage/ModerationPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/admin/users',
    element: <ProtectedRoute requiredRole="ROLE_ADMIN"><div /></ProtectedRoute>,
    lazy: () => import('../pages/AdminPage/UsersPage').then(m => ({ Component: m.default })),
  },

  // ── 404 ──────────────────────────────────────────────────────
  {
    path: '*',
    lazy: () => import('../pages/NotFoundPage').then(m => ({ Component: m.default })),
  },
])

export default router
