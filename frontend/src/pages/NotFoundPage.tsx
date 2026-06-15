import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function NotFoundPage() {
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
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: '6rem', md: '10rem' }, fontWeight: 800, color: 'primary.light', lineHeight: 1 }}
      >
        404
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
        Сторінку не знайдено
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        Можливо, посилання застаріле або сторінку було переміщено.
      </Typography>
      <Button component={Link} to="/" variant="contained" size="large">
        На головну
      </Button>
    </Box>
  )
}
