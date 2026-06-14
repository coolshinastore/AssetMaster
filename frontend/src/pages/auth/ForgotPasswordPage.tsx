import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { forgotPassword } from '../../features/auth/authApi'

const schema = z.object({
  email: z.string().email('Невірний формат email'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormData) => {
    setServerError(null)
    try {
      await forgotPassword(email)
      setDone(true)
    } catch {
      setServerError('Сталася помилка. Спробуйте ще раз.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {done ? (
          <>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 2, letterSpacing: '-0.03em' }}>
              Перевірте пошту
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Якщо обліковий запис з таким email існує, ми надіслали інструкції для відновлення пароля.
            </Typography>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              У dev-режимі посилання виводиться в консоль бекенду (SLF4J лог з префіксом [EMAIL]).
            </Alert>
            <Button component={Link} to="/auth/login" variant="outlined" sx={{ borderRadius: 3 }}>
              Повернутись до входу
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 1, letterSpacing: '-0.03em' }}>
              Відновлення пароля
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Введіть email вашого акаунту — ми надішлемо посилання для скидання пароля.
            </Typography>

            {serverError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                autoFocus
                fullWidth
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                sx={{ py: 1.5, borderRadius: 3 }}
              >
                {isSubmitting ? 'Надсилання...' : 'Надіслати посилання'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link to="/auth/login" style={{ fontSize: 14, color: '#3B82F6', textDecoration: 'none' }}>
                  ← Повернутись до входу
                </Link>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
