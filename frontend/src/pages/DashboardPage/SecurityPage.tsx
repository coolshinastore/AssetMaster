import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../features/auth/AuthContext'
import * as authApi from '../../features/auth/authApi'
import type { UserDto } from '../../features/auth/types'

const codeSchema = z.object({
  code: z.string().length(6, 'Код складається з 6 цифр').regex(/^\d+$/, 'Тільки цифри'),
})
type CodeForm = z.infer<typeof codeSchema>

function TotpSetupSection({ user, onUpdated }: { user: UserDto; onUpdated: () => Promise<void> }) {
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null)
  const [setupError, setSetupError] = useState('')
  const [loading, setLoading] = useState(false)

  const enableForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) })
  const disableForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) })

  const handleSetup = async () => {
    setLoading(true)
    setSetupError('')
    try {
      const res = await authApi.setup2fa()
      setSetupData(res.data)
    } catch {
      setSetupError('Помилка отримання QR-коду.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async ({ code }: CodeForm) => {
    setSetupError('')
    try {
      await authApi.enable2fa(code)
      await onUpdated()
      setSetupData(null)
      enableForm.reset()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Невірний код.'
      setSetupError(msg)
    }
  }

  const handleDisable = async ({ code }: CodeForm) => {
    setSetupError('')
    try {
      await authApi.disable2fa(code)
      await onUpdated()
      disableForm.reset()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Невірний код.'
      setSetupError(msg)
    }
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Двофакторна автентифікація (2FA)
          </Typography>
          <Chip
            label={user.totpEnabled ? 'Увімкнено' : 'Вимкнено'}
            color={user.totpEnabled ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Додатковий захист акаунту за допомогою TOTP-автентифікатора (Google Authenticator, Authy тощо).
        </Typography>

        {setupError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{setupError}</Alert>
        )}

        {!user.totpEnabled ? (
          <>
            {!setupData ? (
              <Button
                variant="outlined"
                onClick={handleSetup}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{ borderRadius: 2 }}
              >
                Налаштувати 2FA
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Відскануйте QR-код в застосунку-автентифікаторі, або введіть секрет вручну.
                </Alert>

                {/* QR placeholder — use otpauth:// URI rendered as image via Google Chart API (offline: show manual secret) */}
                <Box
                  component="img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.uri)}`}
                  alt="QR код для 2FA"
                  sx={{ width: 200, height: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                />

                <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Або введіть секрет вручну:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', wordBreak: 'break-all' }}
                  >
                    {setupData.secret}
                  </Typography>
                </Box>

                <Box component="form" onSubmit={enableForm.handleSubmit(handleEnable)} noValidate sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <TextField
                    label="Код підтвердження"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    size="small"
                    inputProps={{ maxLength: 6 }}
                    {...enableForm.register('code')}
                    error={!!enableForm.formState.errors.code}
                    helperText={enableForm.formState.errors.code?.message}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={enableForm.formState.isSubmitting}
                    sx={{ borderRadius: 2, mt: 0.25 }}
                  >
                    Увімкнути
                  </Button>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box component="form" onSubmit={disableForm.handleSubmit(handleDisable)} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Введіть поточний код з автентифікатора, щоб вимкнути 2FA:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField
                label="Код 2FA"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                size="small"
                inputProps={{ maxLength: 6 }}
                {...disableForm.register('code')}
                error={!!disableForm.formState.errors.code}
                helperText={disableForm.formState.errors.code?.message}
                sx={{ flex: 1 }}
              />
              <Button
                type="submit"
                variant="outlined"
                color="error"
                disabled={disableForm.formState.isSubmitting}
                sx={{ borderRadius: 2, mt: 0.25 }}
              >
                Вимкнути 2FA
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function SecurityPage() {
  const { user, refreshUser } = useAuth()

  if (!user) return null

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', px: { xs: 2, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}>
        Безпека
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Управління паролем та двофакторною автентифікацією.
      </Typography>

      <TotpSetupSection user={user} onUpdated={refreshUser} />

      <Divider sx={{ my: 4 }} />

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Підтвердження email
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Chip
              label={user.emailVerified ? 'Підтверджено' : 'Не підтверджено'}
              color={user.emailVerified ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
