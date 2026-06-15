import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../shared/components/ProtectedRoute'
import DashboardLayout from '../widgets/DashboardLayout/DashboardLayout'
import PublicLayout from '../widgets/PublicLayout/PublicLayout'

const router = createBrowserRouter([
  // ── Public (Navbar + Footer via PublicLayout) ─────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', lazy: () => import('../pages/HomePage/HomePage').then(m => ({ Component: m.default })) },
      { path: '/catalog', lazy: () => import('../pages/CatalogPage/CatalogPage').then(m => ({ Component: m.default })) },
      { path: '/catalog/:categorySlug', lazy: () => import('../pages/CatalogPage/CatalogPage').then(m => ({ Component: m.default })) },
      { path: '/search', lazy: () => import('../pages/CatalogPage/CatalogPage').then(m => ({ Component: m.default })) },
      { path: '/assets/:id', lazy: () => import('../pages/AssetPage/AssetPage').then(m => ({ Component: m.default })) },
      { path: '/cart', lazy: () => import('../pages/CartPage/CartPage').then(m => ({ Component: m.default })) },
      { path: '/about', lazy: () => import('../pages/AboutPage').then(m => ({ Component: m.default })) },
      { path: '/faq', lazy: () => import('../pages/FaqPage').then(m => ({ Component: m.default })) },
      { path: '/licenses', lazy: () => import('../pages/LicensesPage').then(m => ({ Component: m.default })) },
      { path: '/contact', lazy: () => import('../pages/ContactPage').then(m => ({ Component: m.default })) },
      { path: '/blog', lazy: () => import('../pages/BlogPage').then(m => ({ Component: m.default })) },
      { path: '/blog/:slug', lazy: () => import('../pages/BlogPostPage').then(m => ({ Component: m.default })) },
    ],
  },

  // ── Auth ─────────────────────────────────────────────────────
  {
    path: '/auth/login',
    lazy: () => import('../pages/auth/LoginPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/auth/register',
    lazy: () => import('../pages/auth/RegisterPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/auth/forgot-password',
    lazy: () => import('../pages/auth/ForgotPasswordPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/auth/reset-password',
    lazy: () => import('../pages/auth/ResetPasswordPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/auth/verify-email',
    lazy: () => import('../pages/auth/EmailVerificationPage').then(m => ({ Component: m.default })),
  },

  // ── System pages (no layout) ──────────────────────────────────
  {
    path: '/500',
    lazy: () => import('../pages/ErrorPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/maintenance',
    lazy: () => import('../pages/MaintenancePage').then(m => ({ Component: m.default })),
  },

  // ── Checkout (ProtectedRoute, own Navbar+Footer) ──────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/checkout',
        lazy: () => import('../pages/CheckoutPage/CheckoutPage').then(m => ({ Component: m.default })),
      },
      {
        path: '/checkout/success',
        lazy: () => import('../pages/CheckoutPage/CheckoutSuccessPage').then(m => ({ Component: m.default })),
      },
    ],
  },

  // ── Dashboard (all authenticated users) ──────────────────────
  {
    element: <ProtectedRoute />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: '/dashboard/profile', lazy: () => import('../pages/DashboardPage/ProfilePage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/purchases', lazy: () => import('../pages/DashboardPage/PurchasesPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/wishlist', lazy: () => import('../pages/DashboardPage/WishlistPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/security', lazy: () => import('../pages/DashboardPage/SecurityPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/notifications', lazy: () => import('../pages/DashboardPage/NotificationsPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/payments', lazy: () => import('../pages/DashboardPage/PaymentsPage').then(m => ({ Component: m.default })) },
      ],
    }],
  },

  // ── Author dashboard ──────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="ROLE_AUTHOR" />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: '/dashboard/assets', lazy: () => import('../pages/DashboardPage/AssetsPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/assets/new', lazy: () => import('../pages/DashboardPage/AssetUploadPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/assets/:id/edit', lazy: () => import('../pages/DashboardPage/AssetEditPage').then(m => ({ Component: m.default })) },
        { path: '/dashboard/analytics', lazy: () => import('../pages/DashboardPage/AnalyticsPage').then(m => ({ Component: m.default })) },
      ],
    }],
  },

  // ── Admin ─────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="ROLE_ADMIN" />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: '/admin', lazy: () => import('../pages/AdminPage/AdminDashboardPage').then(m => ({ Component: m.default })) },
        { path: '/admin/moderation', lazy: () => import('../pages/AdminPage/ModerationPage').then(m => ({ Component: m.default })) },
        { path: '/admin/users', lazy: () => import('../pages/AdminPage/UsersPage').then(m => ({ Component: m.default })) },
        { path: '/admin/finance', lazy: () => import('../pages/AdminPage/AdminFinancePage').then(m => ({ Component: m.default })) },
        { path: '/admin/analytics', lazy: () => import('../pages/AdminPage/AdminAnalyticsPage').then(m => ({ Component: m.default })) },
        { path: '/admin/categories', lazy: () => import('../pages/AdminPage/CategoriesPage').then(m => ({ Component: m.default })) },
      ],
    }],
  },

  // ── 404 ───────────────────────────────────────────────────────
  {
    path: '*',
    lazy: () => import('../pages/NotFoundPage').then(m => ({ Component: m.default })),
  },
])

export default router
