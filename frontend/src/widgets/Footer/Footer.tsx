import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 },
        mt: 'auto',
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 }, mb: 5 }}>
          {/* Brand */}
          <Box sx={{ flex: '1 1 220px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box
                sx={{
                  width: 28, height: 28,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #3B82F6, #1A1F3C)',
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontWeight: 700 }} color="text.primary">AssetMaster</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Маркетплейс цифрових активів для дизайнерів, розробників та авторів.
            </Typography>
          </Box>

          {/* Links */}
          <Box sx={{ display: 'flex', gap: { xs: 4, md: 8 }, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Платформа</Typography>
              {[['Каталог', '/catalog'], ['Про нас', '/about'], ['Блог', '/blog']].map(([label, href]) => (
                <Box key={href} sx={{ mb: 1 }}>
                  <Typography
                    component={Link}
                    to={href}
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Підтримка</Typography>
              {[['FAQ', '/faq'], ['Контакти', '/contact'], ['Ліцензії', '/licenses']].map(([label, href]) => (
                <Box key={href} sx={{ mb: 1 }}>
                  <Typography
                    component={Link}
                    to={href}
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} AssetMaster. Всі права захищено.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[['Умови використання', '/licenses'], ['Конфіденційність', '/contact']].map(([label, href]) => (
              <Typography
                key={href}
                component={Link}
                to={href}
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
