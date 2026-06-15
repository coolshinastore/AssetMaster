import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'

export default function ErrorPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        bgcolor: 'background.default',
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 72, color: 'error.main', mb: 2 }} />
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: '5rem', md: '8rem' }, fontWeight: 800, color: 'error.light', lineHeight: 1 }}
      >
        500
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
        Серверна помилка
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 420 }}>
        Щось пішло не так на нашому боці. Ми вже працюємо над вирішенням проблеми.
        Спробуйте знову за кілька хвилин.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Оновити сторінку
        </Button>
        <Button component={Link} to="/" variant="contained">
          На головну
        </Button>
      </Box>
    </Box>
  )
}
