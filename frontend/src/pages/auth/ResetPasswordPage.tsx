import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { resetPassword } from '../../features/auth/authApi'

const schema = z
  .object({
    newPassword: z.string().min(8, 'Мінімум 8 символів'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Паролі не збігаються',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 4 }}>
        <Alert severity="error">Токен відсутній або невалідний. Запросіть нове посилання.</Alert>
      </Box>
    )
  }

  const onSubmit = async ({ newPassword }: FormData) => {
    setServerError(null)
    try {
      await resetPassword(token, newPassword)
      setDone(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Помилка. Можливо, токен прострочений або вже використаний.'
      setServerError(msg)
    }
  }

  if (done) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 2, letterSpacing: '-0.03em' }}>
            Пароль змінено
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Ви можете увійти з новим паролем.
          </Typography>
          <Button component={Link} to="/auth/login" variant="contained" sx={{ borderRadius: 3 }}>
            Увійти
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 1, letterSpacing: '-0.03em' }}>
          Новий пароль
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Введіть новий пароль для вашого акаунту.
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Новий пароль"
            type="password"
            autoFocus
            fullWidth
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            label="Підтвердіть пароль"
            type="password"
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
            sx={{ py: 1.5, borderRadius: 3 }}
          >
            {isSubmitting ? 'Збереження...' : 'Зберегти пароль'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
