import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { verifyEmail } from '../../features/auth/authApi'

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setErrorMsg('Токен відсутній.')
      setStatus('error')
      return
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          ?? 'Посилання недійсне або прострочене.'
        setErrorMsg(msg)
        setStatus('error')
      })
  }, [token])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="body1" color="text.secondary">Підтвердження email...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 2, letterSpacing: '-0.03em' }}>
              Email підтверджено
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ваш email успішно підтверджено. Тепер ви можете користуватися всіма функціями AssetMaster.
            </Typography>
            <Button component={Link} to="/" variant="contained" sx={{ borderRadius: 3 }}>
              На головну
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 2, letterSpacing: '-0.03em' }}>
              Помилка підтвердження
            </Typography>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
              {errorMsg}
            </Alert>
            <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: 3 }}>
              На головну
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
