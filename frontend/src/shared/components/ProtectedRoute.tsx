import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import type { ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

interface Props {
  children: ReactNode
  requiredRole?: 'ROLE_USER' | 'ROLE_AUTHOR' | 'ROLE_ADMIN'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
