import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Navbar from '../../widgets/Navbar/Navbar'
import Footer from '../../widgets/Footer/Footer'
import AssetGrid from '../../widgets/AssetGrid/AssetGrid'
import SearchBar from '../../features/search/SearchBar'
import { useTrendingAssets, useNewAssets, useCategories } from '../../entities/asset/api/useAssets'
import { useAuth } from '../../features/auth/AuthContext'
import type { CategoryDto } from '../../entities/asset/types'

const POPULAR_TAGS = ['3D Моделі', 'UI Kit', 'Шрифти', 'Ілюстрації', 'Game Assets']
const TRUST_METRICS = [
  { value: '180K+', label: 'активів' },
  { value: '12K+',  label: 'авторів' },
  { value: '4.9★',  label: 'рейтинг' },
  { value: '8.2M',  label: 'завантажень' },
]

export default function HomePage() {
  const { user } = useAuth()
  const { data: trending,  isLoading: loadingTrending } = useTrendingAssets()
  const { data: newAssets, isLoading: loadingNew }      = useNewAssets()
  const { data: categories } = useCategories()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#1A1F3C',
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '30%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700, height: 500,
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.04em',
              mb: 2,
              lineHeight: 1.15,
            }}
          >
            Маркетплейс{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              цифрових активів
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.65)', mb: 5, fontSize: '1.1rem' }}
          >
            3D-моделі, UI Kit, шрифти, ілюстрації та інше від кращих авторів
          </Typography>

          {/* Hero search */}
          <Box sx={{ maxWidth: 560, mx: 'auto', mb: 4 }}>
            <SearchBar large />
          </Box>

          {/* Popular tags */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
            {POPULAR_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                component={Link}
                to={`/search?q=${encodeURIComponent(tag)}`}
                clickable
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              />
            ))}
          </Box>

          {/* Trust metrics */}
          <Box sx={{ display: 'flex', gap: { xs: 3, md: 6 }, justifyContent: 'center', flexWrap: 'wrap' }}>
            {TRUST_METRICS.map((m) => (
              <Box key={m.label} sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 800,
                    color: '#3B82F6',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {m.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.25 }}>
                  {m.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Main content ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 8 }}>
        {categories && <CategoryGrid categories={categories} />}

        <Box sx={{ mt: 10 }}>
          <AssetGrid
            label="Популярні"
            assets={trending}
            isLoading={loadingTrending}
            viewAllHref="/catalog?sort=trending"
          />
        </Box>

        <Box sx={{ mt: 10 }}>
          <AssetGrid
            label="Нові надходження"
            assets={newAssets}
            isLoading={loadingNew}
            viewAllHref="/catalog?sort=newest"
          />
        </Box>

        {(!user || user.role === 'ROLE_USER') && (
          <Box sx={{ mt: 10 }}>
            <SellerCtaBanner />
          </Box>
        )}
      </Box>

      <Footer />
    </Box>
  )
}

/* ── CategoryGrid ─────────────────────────────────────────── */
function CategoryGrid({ categories }: { categories: CategoryDto[] }) {
  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 4 }}>Категорії</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(7, 1fr)',
          },
          gap: 2,
        }}
      >
        {categories.map((cat) => (
          <Box
            key={cat.id}
            component={Link}
            to={`/catalog?category=${cat.id}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              border: '1px solid #e5e8f0',
              textDecoration: 'none',
              bgcolor: 'white',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: '#eef4ff',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(59,130,246,0.12)',
              },
            }}
          >
            <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>{cat.iconUrl}</Typography>
            <Typography
              variant="caption"
              color="text.primary"
              align="center"
              sx={{ fontWeight: 600, lineHeight: 1.3 }}
            >
              {cat.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {cat.assetCount}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

/* ── SellerCtaBanner ──────────────────────────────────────── */
function SellerCtaBanner() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#1A1F3C',
        borderRadius: 4,
        p: { xs: 5, md: 8 },
        textAlign: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%', left: '40%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 300,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: 'white',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            mb: 2,
          }}
        >
          Продавайте ваші роботи
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', mb: 3, maxWidth: 460, mx: 'auto' }}>
          Комісія від 15% — одна з найнижчих на ринку. Аналітика, виплати щомісяця.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
          {['Комісія від 15%', 'Щомісячні виплати', 'Власна аналітика'].map((feat) => (
            <Chip
              key={feat}
              label={feat}
              size="small"
              sx={{
                bgcolor: 'rgba(59,130,246,0.2)',
                color: '#93C5FD',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
            />
          ))}
        </Box>

        <Button
          component={Link}
          to="/auth/register"
          variant="contained"
          size="large"
          sx={{ px: 5, py: 1.5 }}
        >
          Почати продавати
        </Button>
      </Box>
    </Box>
  )
}
