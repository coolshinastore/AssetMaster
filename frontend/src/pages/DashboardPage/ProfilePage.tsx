import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useAuth } from '../../features/auth/AuthContext'
import * as authApi from '../../features/auth/authApi'

const ROLE_LABELS: Record<string, string> = {
  ROLE_USER: 'Покупець',
  ROLE_AUTHOR: 'Автор',
  ROLE_ADMIN: 'Адміністратор',
}

const profileSchema = z.object({
  displayName: z.string().min(2, 'Мінімум 2 символи').max(80, 'Максимум 80 символів'),
  avatarUrl: z.string().max(2048, 'URL занадто довгий').url('Невалідний URL').or(z.literal('')),
  bio: z.string().max(1000, 'Максимум 1000 символів'),
})
type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      bio: user?.bio ?? '',
    },
  })

  const avatarUrlValue = watch('avatarUrl')

  const onSubmit = async (data: ProfileForm) => {
    setSuccess(false)
    setApiError('')
    try {
      await authApi.updateProfile({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      })
      await refreshUser()
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не вдалося зберегти зміни.'
      setApiError(msg)
    }
  }

  if (!user) return null

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', px: { xs: 2, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}>
        Профіль
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Публічна інформація про ваш акаунт.
      </Typography>

      {/* Account info — read-only */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Акаунт
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Avatar
              src={avatarUrlValue || user.avatarUrl || undefined}
              sx={{ width: 64, height: 64, fontSize: 28, bgcolor: 'primary.main' }}
            >
              {(user.displayName ?? user.email)[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.displayName ?? user.email}
                </Typography>
                {user.verified && (
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                )}
                <Chip
                  label={ROLE_LABELS[user.role] ?? user.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Редагування
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Профіль збережено.
            </Alert>
          )}
          {apiError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              label="Ім'я або нікнейм"
              fullWidth
              {...register('displayName')}
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
            />

            <TextField
              label="URL аватара"
              fullWidth
              placeholder="https://example.com/avatar.jpg"
              {...register('avatarUrl')}
              error={!!errors.avatarUrl}
              helperText={errors.avatarUrl?.message ?? 'Пряме посилання на зображення'}
            />

            <TextField
              label="Про себе"
              fullWidth
              multiline
              rows={4}
              placeholder="Коротко розкажіть про себе..."
              {...register('bio')}
              error={!!errors.bio}
              helperText={errors.bio?.message ?? `${watch('bio').length}/1000`}
            />

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !isDirty}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Зберегти
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
