import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useAuth } from '../../features/auth/AuthContext'

const schema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Мінімум 8 символів'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch {
      setServerError('Невірний email або пароль')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 4,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Typography
          variant="h1"
          sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 1, letterSpacing: '-0.03em' }}
        >
          Вхід в AssetMaster
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Немає акаунту?{' '}
          <Link
            to="/auth/register"
            style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}
          >
            Зареєструватись
          </Link>
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Пароль"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Box sx={{ textAlign: 'right', mt: -1 }}>
            <Link
              to="/auth/reset-password"
              style={{ fontSize: 14, color: '#3B82F6', textDecoration: 'none' }}
            >
              Забули пароль?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            sx={{ py: 1.5, mt: 1, borderRadius: 3 }}
          >
            {isSubmitting ? 'Вхід...' : 'Увійти'}
          </Button>

          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              або
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            disabled
            sx={{ borderRadius: 3, color: 'text.secondary' }}
          >
            Продовжити з Google (незабаром)
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
