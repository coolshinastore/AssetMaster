import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AssetGrid from '../../widgets/AssetGrid/AssetGrid'
import { useTrendingAssets, useNewAssets, useCategories } from '../../entities/asset/api/useAssets'
import { useAuth } from '../../features/auth/AuthContext'
import type { CategoryDto, AssetSummaryDto } from '../../entities/asset/types'

/* ── Category metadata ── */
const CAT_ICON_PATHS: Record<string, string> = {
  '3D-моделі':   '<path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m3 7 9 5 9-5M12 12v10" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  'UI Kits':     '<path d="M4 5h16v6H4zM4 14h7v5H4zM14 14h6v5h-6z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  'Шрифти':      '<path d="M6 19 12 5l6 14M8.5 14h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  'Ілюстрації':  '<path d="M4 16l5-5 4 4 3-3 4 4M4 5h16v14H4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  'Відео':       '<path d="M4 6h11v12H4zM15 10l5-3v10l-5-3z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  'Аудіо':       '<path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  'Game Assets': '<path d="M7 8h10a4 4 0 0 1 0 8h-1l-2-2H10l-2 2H7a4 4 0 0 1 0-8ZM8 12h2M9 11v2M15 11h.01M17 13h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
}
const CAT_GRADS: Record<string, string> = {
  '3D-моделі':   'linear-gradient(135deg,#6d4bd4,#3a2a7a)',
  'UI Kits':     'linear-gradient(135deg,#3B82F6,#1f3d8f)',
  'Шрифти':      'linear-gradient(135deg,#475178,#22273f)',
  'Ілюстрації':  'linear-gradient(135deg,#f0764e,#b23a52)',
  'Відео':       'linear-gradient(135deg,#2fa6c4,#1d5e8f)',
  'Аудіо':       'linear-gradient(135deg,#27a06a,#176b54)',
  'Game Assets': 'linear-gradient(135deg,#e0a23c,#a85f24)',
}

const POPULAR_TAGS = ['3D characters', 'Mobile UI kits', 'Display fonts', 'Lo-fi audio']

const TRUST_STATS = [
  { num: '180', suffix: 'K+', label: 'цифрових активів' },
  { num: '12',  suffix: 'K+', label: 'перевірених авторів' },
  { num: '4.9', suffix: '/5', label: '26 400 відгуків', stars: true },
  { num: '8.2', suffix: 'M',  label: 'завантажень' },
]

const FILTER_TABS = ['Усі', '3D-моделі', 'UI Kits', 'Шрифти', 'Ілюстрації', 'Відео', 'Аудіо', 'Game Assets']

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [heroQuery, setHeroQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Усі')

  const { data: trending,  isLoading: loadingTrending } = useTrendingAssets()
  const { data: newAssets, isLoading: loadingNew }      = useNewAssets()
  const { data: categories } = useCategories()

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroQuery.trim()) navigate(`/search?q=${encodeURIComponent(heroQuery.trim())}`)
  }

  const filteredTrending: AssetSummaryDto[] | undefined =
    activeFilter === 'Усі'
      ? trending
      : trending?.filter(a => a.categoryName === activeFilter)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: '48px', sm: '64px', md: '80px' },
          pb: { xs: '40px', md: '64px' },
          background: `
            radial-gradient(1200px 500px at 80% -10%, #eef4ff, transparent 70%),
            radial-gradient(900px 460px at 5% 110%, #f3f0ff, transparent 65%)
          `,
        }}
      >
        {/* Faint grid overlay */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(#e5e8f0 1px, transparent 1px), linear-gradient(90deg, #e5e8f0 1px, transparent 1px)',
            backgroundSize: '46px 46px',
            opacity: 0.35,
            maskImage: 'radial-gradient(900px 420px at 50% 30%, #000, transparent 75%)',
          }}
        />

        <Box sx={{ position: 'relative', maxWidth: '820px', mx: 'auto', px: 3, textAlign: 'center' }}>
          {/* Eyebrow pill */}
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '13.5px', fontWeight: 600, color: '#1f5bd1',
              bgcolor: '#fff', border: '1px solid #d7e4fd',
              px: '14px', py: '7px', borderRadius: '999px',
              boxShadow: '0 1px 2px rgba(26,31,60,0.06)',
              mb: '24px',
            }}
          >
            <Box
              sx={{
                width: 7, height: 7, borderRadius: '50%',
                bgcolor: '#1aa06a',
                boxShadow: '0 0 0 3px #e6f6ef',
              }}
              aria-hidden="true"
            />
            4 200+ нових активів цього тижня
          </Box>

          {/* H1 */}
          <Typography
            component="h1"
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 'clamp(38px, 5.4vw, 60px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              color: '#1A1F3C',
              mb: '20px',
            }}
          >
            Цифрові активи для
            <br />
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(115deg, #2f6fe0, #7c5cff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              креативних команд
            </Box>
          </Typography>

          {/* Subheading */}
          <Typography
            sx={{
              fontSize: 'clamp(17px, 1.6vw, 20px)',
              color: '#5b6280',
              lineHeight: 1.55,
              maxWidth: '600px',
              mx: 'auto',
              mb: '32px',
            }}
          >
            3D-моделі, UI kits, шрифти, ілюстрації, відео та звук від 12 000+ перевірених авторів.
            Знаходьте, ліцензуйте та завантажуйте за лічені секунди.
          </Typography>

          {/* Hero search */}
          <Box
            component="form"
            role="search"
            onSubmit={handleHeroSearch}
            sx={{
              display: 'flex', alignItems: 'center', gap: '8px',
              maxWidth: '640px', mx: 'auto', mb: '20px',
              bgcolor: '#fff', border: '1.5px solid #d7dce8', borderRadius: '16px',
              p: '8px 8px 8px 18px',
              boxShadow: '0 8px 24px rgba(26,31,60,0.10)',
              transition: 'border-color 0.16s, box-shadow 0.16s',
              '&:focus-within': {
                borderColor: '#3B82F6',
                boxShadow: '0 0 0 3px rgba(59,130,246,0.35), 0 8px 24px rgba(26,31,60,0.10)',
              },
            }}
          >
            <SearchIcon sx={{ color: '#767d97', fontSize: 20, flexShrink: 0 }} />
            <InputBase
              id="hero-search"
              inputProps={{ 'aria-label': 'Що ви шукаєте?' }}
              placeholder="Спробуйте «isometric icons» або «brand fonts»…"
              value={heroQuery}
              onChange={e => setHeroQuery(e.target.value)}
              sx={{
                flex: 1,
                '& input': { fontSize: '16.5px', color: '#1A1F3C', '&::placeholder': { color: '#767d97' } },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ borderRadius: '12px', px: '20px', py: '11px', fontWeight: 600, flexShrink: 0 }}
            >
              Знайти
            </Button>
          </Box>

          {/* Popular tags */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', mb: '48px' }}>
            <Typography sx={{ fontSize: '13.5px', color: '#767d97' }}>Популярне:</Typography>
            {POPULAR_TAGS.map((tag) => (
              <Box
                key={tag}
                component={Link}
                to={`/search?q=${encodeURIComponent(tag)}`}
                sx={{
                  fontSize: '13.5px', color: '#3a4163',
                  px: '12px', py: '5px', borderRadius: '999px',
                  border: '1px solid #e5e8f0', bgcolor: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.14s',
                  '&:hover': { borderColor: '#3B82F6', color: '#1f5bd1', bgcolor: '#eef4ff' },
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>

          {/* Trust stats */}
          <Box
            role="list"
            aria-label="Показники довіри"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 3, sm: 5, md: 8 },
              flexWrap: 'wrap',
            }}
          >
            {TRUST_STATS.map((s, i) => (
              <Box key={i} role="listitem" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                {i > 0 && (
                  <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: '#e5e8f0', display: { xs: 'none', sm: 'block' } }} aria-hidden="true" />
                )}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 'clamp(26px, 3vw, 34px)', color: '#1A1F3C', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {s.num}
                    <Box component="span" sx={{ color: '#3B82F6' }}>{s.suffix}</Box>
                  </Box>
                  {s.stars && (
                    <Box sx={{ display: 'inline-flex', gap: '2px', color: '#f5a623', fontSize: '14px', lineHeight: 1 }} aria-hidden="true">
                      {'★★★★★'}
                    </Box>
                  )}
                  <Typography sx={{ fontSize: '13.5px', color: '#767d97', mt: '2px' }}>
                    {s.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, maxWidth: '1200px', mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: '24px' } }}>

        {/* ── Categories ── */}
        {categories && (
          <Box component="section" id="categories" sx={{ py: { xs: 6, md: '64px' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: '32px' }}>
              <Box>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 'clamp(26px,3vw,34px)', color: '#1A1F3C', letterSpacing: '-0.02em' }}>
                  Огляд за категоріями
                </Typography>
                <Typography sx={{ color: '#5b6280', mt: '8px', fontSize: '16px' }}>
                  Сім ринків активів — від рендер-ready 3D до готового до релізу аудіо.
                </Typography>
              </Box>
              <Box
                component={Link}
                to="/catalog"
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  color: '#1f5bd1', fontWeight: 600, fontSize: '15px',
                  textDecoration: 'none', flexShrink: 0,
                  '&:hover svg': { transform: 'translateX(3px)' },
                }}
              >
                Усі категорії
                <ArrowForwardIcon sx={{ fontSize: 16, transition: 'transform 0.15s' }} />
              </Box>
            </Box>

            <CategoryGrid categories={categories} />
          </Box>
        )}

        {/* ── Trending assets ── */}
        <Box component="section" id="assets" sx={{ pb: { xs: 6, md: '64px' } }}>
          {/* Section header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: '32px' }}>
            <Box>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 'clamp(26px,3vw,34px)', color: '#1A1F3C', letterSpacing: '-0.02em' }}>
                У тренді цього тижня
              </Typography>
              <Typography sx={{ color: '#5b6280', mt: '8px', fontSize: '16px' }}>
                Підібрано редакцією на основі завантажень, рейтингів та свіжості.
              </Typography>
            </Box>
            <Box
              component={Link}
              to="/catalog?sort=trending"
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: '#1f5bd1', fontWeight: 600, fontSize: '15px',
                textDecoration: 'none', flexShrink: 0,
                '&:hover svg': { transform: 'translateX(3px)' },
              }}
            >
              Дивитися всі
              <ArrowForwardIcon sx={{ fontSize: 16, transition: 'transform 0.15s' }} />
            </Box>
          </Box>

          {/* Filter chips */}
          <Box
            role="tablist"
            aria-label="Фільтр активів"
            sx={{ display: 'flex', gap: 1, mb: '24px', flexWrap: 'wrap' }}
          >
            {FILTER_TABS.map((tab) => (
              <Box
                key={tab}
                component="button"
                role="tab"
                aria-selected={activeFilter === tab}
                onClick={() => setActiveFilter(tab)}
                sx={{
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '14px',
                  px: '16px', py: '9px', borderRadius: '999px',
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.14s',
                  ...(activeFilter === tab
                    ? { bgcolor: '#1A1F3C', color: '#fff', borderColor: '#1A1F3C' }
                    : { bgcolor: '#fff', color: '#5b6280', borderColor: '#e5e8f0', '&:hover': { borderColor: '#d7dce8', color: '#1A1F3C' } }
                  ),
                }}
              >
                {tab}
              </Box>
            ))}
          </Box>

          <AssetGrid
            label=""
            assets={filteredTrending}
            isLoading={loadingTrending}
          />
        </Box>

        {/* ── New arrivals ── */}
        <Box component="section" sx={{ pb: { xs: 6, md: '64px' } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: '32px' }}>
            <Box>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 'clamp(26px,3vw,34px)', color: '#1A1F3C', letterSpacing: '-0.02em' }}>
                Нові надходження
              </Typography>
              <Typography sx={{ color: '#5b6280', mt: '8px', fontSize: '16px' }}>
                Щойно додані активи від авторів по всьому світу.
              </Typography>
            </Box>
            <Box
              component={Link}
              to="/catalog?sort=newest"
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: '#1f5bd1', fontWeight: 600, fontSize: '15px',
                textDecoration: 'none', flexShrink: 0,
                '&:hover svg': { transform: 'translateX(3px)' },
              }}
            >
              Дивитися всі
              <ArrowForwardIcon sx={{ fontSize: 16, transition: 'transform 0.15s' }} />
            </Box>
          </Box>
          <AssetGrid
            label=""
            assets={newAssets}
            isLoading={loadingNew}
          />
        </Box>

        {/* ── Seller CTA ── */}
        {(!user || user.role === 'ROLE_USER') && (
          <Box component="section" id="seller" sx={{ pb: { xs: 6, md: '96px' } }}>
            <SellerCtaBanner />
          </Box>
        )}
      </Box>
    </Box>
  )
}

/* ── CategoryGrid ──────────────────────────────────────────── */
function CategoryGrid({ categories }: { categories: CategoryDto[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(4, 1fr)',
          lg: 'repeat(7, 1fr)',
        },
        gap: '16px',
      }}
    >
      {categories.map((cat) => {
        const grad = CAT_GRADS[cat.name] ?? 'linear-gradient(135deg,#475178,#22273f)'
        const iconPaths = CAT_ICON_PATHS[cat.name]
        return (
          <Box
            key={cat.id}
            component={Link}
            to={`/catalog?category=${cat.id}`}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '12px', p: '22px 12px',
              bgcolor: '#fff', border: '1px solid #e5e8f0', borderRadius: '16px',
              textDecoration: 'none',
              transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(26,31,60,0.10)',
                borderColor: 'transparent',
              },
            }}
          >
            {/* Gradient icon chip */}
            <Box
              sx={{
                width: 52, height: 52, borderRadius: '14px',
                background: grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
              }}
            >
              {iconPaths ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="24"
                  height="24"
                  dangerouslySetInnerHTML={{ __html: iconPaths }}
                />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>
                  {cat.name.slice(0, 2).toUpperCase()}
                </Typography>
              )}
            </Box>

            <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '14.5px', color: '#1A1F3C', textAlign: 'center', lineHeight: 1.3 }}>
              {cat.name}
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#767d97', mt: '-8px' }}>
              {cat.assetCount?.toLocaleString() ?? ''}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

/* ── SellerCtaBanner ──────────────────────────────────────── */
function SellerCtaBanner() {
  const STATS = [
    { n: 'до 80%',  l: 'роялті з кожного продажу' },
    { n: '$2.4M+',  l: 'виплачено авторам за 2025' },
    { n: '7 днів',  l: 'цикл виплат на гаманець' },
  ]

  return (
    <Box
      sx={{
        bgcolor: '#1A1F3C',
        borderRadius: '22px',
        p: { xs: '36px 24px', md: 'clamp(36px, 5vw, 60px)' },
        position: 'relative', overflow: 'hidden', color: '#fff',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' },
        gap: { xs: '32px', md: '40px' },
        alignItems: 'center',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background: 'radial-gradient(600px 300px at 90% 10%, rgba(59,130,246,0.4), transparent 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Text */}
      <Box sx={{ position: 'relative' }}>
        <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 'clamp(26px, 3.2vw, 38px)', color: '#fff', letterSpacing: '-0.02em' }}>
          Перетворіть свою творчість на дохід
        </Typography>
        <Typography sx={{ color: '#b9c0db', mt: '14px', fontSize: '17px', maxWidth: '460px' }}>
          Завантажуйте активи один раз — продавайте безліч разів. Залишайте до 80% з кожного продажу,
          отримуйте виплати щотижня та аналітику в реальному часі.
        </Typography>
        <Box sx={{ display: 'flex', gap: '12px', mt: '26px', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/auth/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#fff', color: '#1A1F3C',
              fontWeight: 600, borderRadius: '12px',
              '&:hover': { bgcolor: '#eef4ff' },
            }}
          >
            Стати автором
          </Button>
          <Button
            component={Link}
            to="/about"
            size="large"
            sx={{
              color: '#fff', fontWeight: 600, borderRadius: '12px',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.3)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            Як це працює
          </Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box sx={{ position: 'relative', display: 'grid', gap: '14px' }}>
        {STATS.map((s) => (
          <Box
            key={s.n}
            sx={{
              bgcolor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              p: '18px 20px',
            }}
          >
            <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '26px', color: '#fff' }}>
              {s.n}
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: '#aab2d2', mt: '2px' }}>
              {s.l}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
