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

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Мінімум 8 символів'),
})

const totpSchema = z.object({
  code: z.string().length(6, 'Код складається з 6 цифр').regex(/^\d+$/, 'Тільки цифри'),
})

type LoginFormData = z.infer<typeof loginSchema>
type TotpFormData = z.infer<typeof totpSchema>

export default function LoginPage() {
  const { login, verify2fa } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const [step, setStep] = useState<'credentials' | 'totp'>('credentials')
  const [partialToken, setPartialToken] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
  const totpForm = useForm<TotpFormData>({ resolver: zodResolver(totpSchema) })

  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const result = await login(data)
      if (result.requires2fa) {
        setPartialToken(result.partialToken)
        setStep('totp')
      } else {
        navigate(from, { replace: true })
      }
    } catch {
      setServerError('Невірний email або пароль')
    }
  }

  const onTotpSubmit = async (data: TotpFormData) => {
    setServerError(null)
    try {
      await verify2fa(partialToken, data.code)
      navigate(from, { replace: true })
    } catch {
      setServerError('Невірний код 2FA. Спробуйте ще раз.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>

        {step === 'credentials' ? (
          <>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 1, letterSpacing: '-0.03em' }}>
              Вхід в AssetMaster
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Немає акаунту?{' '}
              <Link to="/auth/register" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                Зареєструватись
              </Link>
            </Typography>

            {serverError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
            )}

            <Box component="form" onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                fullWidth
                {...loginForm.register('email')}
                error={!!loginForm.formState.errors.email}
                helperText={loginForm.formState.errors.email?.message}
              />
              <TextField
                label="Пароль"
                type="password"
                autoComplete="current-password"
                fullWidth
                {...loginForm.register('password')}
                error={!!loginForm.formState.errors.password}
                helperText={loginForm.formState.errors.password?.message}
              />

              <Box sx={{ textAlign: 'right', mt: -1 }}>
                <Link to="/auth/forgot-password" style={{ fontSize: 14, color: '#3B82F6', textDecoration: 'none' }}>
                  Забули пароль?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loginForm.formState.isSubmitting}
                sx={{ py: 1.5, mt: 1, borderRadius: 3 }}
              >
                {loginForm.formState.isSubmitting ? 'Вхід...' : 'Увійти'}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">або</Typography>
              </Divider>

              <Button variant="outlined" size="large" fullWidth disabled sx={{ borderRadius: 3, color: 'text.secondary' }}>
                Продовжити з Google (незабаром)
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 1, letterSpacing: '-0.03em' }}>
              Двофакторна автентифікація
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Введіть 6-значний код з вашого застосунку-автентифікатора
            </Typography>

            {serverError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>
            )}

            <Box component="form" onSubmit={totpForm.handleSubmit(onTotpSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Код 2FA"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                fullWidth
                placeholder="000000"
                inputProps={{ maxLength: 6 }}
                {...totpForm.register('code')}
                error={!!totpForm.formState.errors.code}
                helperText={totpForm.formState.errors.code?.message}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={totpForm.formState.isSubmitting}
                sx={{ py: 1.5, borderRadius: 3 }}
              >
                {totpForm.formState.isSubmitting ? 'Перевірка...' : 'Підтвердити'}
              </Button>

              <Button
                variant="text"
                onClick={() => { setStep('credentials'); setServerError(null) }}
                sx={{ color: 'text.secondary' }}
              >
                ← Повернутись
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
