import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useAuth } from '../../features/auth/AuthContext'

const schema = z
  .object({
    email: z.string().email('Невірний формат email'),
    displayName: z.string().min(2, 'Мінімум 2 символи').max(80, 'Максимум 80 символів'),
    password: z.string().min(8, 'Мінімум 8 символів'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Паролі не збігаються',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, displayName, password }: FormData) => {
    setServerError(null)
    try {
      await authRegister({ email, displayName, password })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Помилка реєстрації. Спробуйте ще раз.'
      setServerError(msg)
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
          Створити акаунт
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Вже є акаунт?{' '}
          <Link
            to="/auth/login"
            style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}
          >
            Увійти
          </Link>
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Ім'я або нікнейм"
            autoFocus
            fullWidth
            {...register('displayName')}
            error={!!errors.displayName}
            helperText={errors.displayName?.message}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Пароль"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            label="Підтвердіть пароль"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            sx={{ py: 1.5, mt: 1, borderRadius: 3 }}
          >
            {isSubmitting ? 'Реєстрація...' : 'Зареєструватись'}
          </Button>

          <Divider>
            <Typography variant="body2" color="text.secondary">
              Реєструючись, ви погоджуєтесь з{' '}
              <Link to="/licenses" style={{ color: '#3B82F6', textDecoration: 'none' }}>
                умовами використання
              </Link>
            </Typography>
          </Divider>
        </Box>
      </Box>
    </Box>
  )
}
