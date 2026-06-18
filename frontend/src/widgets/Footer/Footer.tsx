import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const FOOTER_COLS = [
  {
    title: 'Маркетплейс',
    links: [
      ['3D-моделі',   '/catalog?category=1'],
      ['UI Kits',     '/catalog?category=2'],
      ['Шрифти',      '/catalog?category=3'],
      ['Ілюстрації',  '/catalog?category=4'],
      ['Game Assets', '/catalog?category=7'],
    ],
  },
  {
    title: 'Для авторів',
    links: [
      ['Почати продавати', '/auth/register'],
      ['Виплати',          '/dashboard/payments'],
      ['Аналітика',        '/dashboard/analytics'],
    ],
  },
  {
    title: 'Компанія',
    links: [
      ['Про нас',   '/about'],
      ['Блог',      '/blog'],
      ['Контакти',  '/contact'],
    ],
  },
  {
    title: 'Підтримка',
    links: [
      ['FAQ',       '/faq'],
      ['Ліцензії',  '/licenses'],
    ],
  },
]

const SOCIAL: { label: string; svg: string }[] = [
  {
    label: 'X / Twitter',
    svg: '<path d="M18 2h3l-7 8 8.5 12h-6.6l-5-7-5.7 7H2l7.5-9L1.5 2h6.7l4.6 6.4L18 2Zm-1.1 18h1.8L7.2 4H5.3l11.6 16Z" fill="currentColor"/>',
  },
  {
    label: 'Instagram',
    svg: '<rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>',
  },
  {
    label: 'Dribbble',
    svg: '<circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8c4 1 9 1.5 13 0M3.5 13c5-1 9 .5 12 4M9 3.5c3 4 5 9 5.5 16" stroke="currentColor" stroke-width="1.8"/>',
  },
  {
    label: 'YouTube',
    svg: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/>',
  },
]

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: '#f8f9fc', borderTop: '1px solid #e5e8f0', pt: { xs: 6, md: '64px' }, pb: { xs: 4, md: '32px' }, mt: 'auto' }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3, md: '24px' } }}>

        {/* ── Top grid ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.6fr repeat(4, 1fr)' },
            gap: { xs: 4, md: '32px' },
            mb: { xs: 5, md: '48px' },
          }}
        >
          {/* Brand column */}
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Box component={Link} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', mb: '16px' }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #3B82F6, #1A1F3C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="19" height="19">
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="m3 7 9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.03em', color: '#1A1F3C' }}>
                AssetMaster
              </Typography>
            </Box>

            <Typography sx={{ color: '#5b6280', fontSize: '14.5px', maxWidth: '300px', lineHeight: 1.6 }}>
              Marketplace цифрових активів для дизайнерів, розробників та творців.
              180 000+ активів, ліцензованих для комерційного використання.
            </Typography>

            {/* Social icons */}
            <Box sx={{ display: 'flex', gap: '8px', mt: '20px' }}>
              {SOCIAL.map((s) => (
                <Box
                  key={s.label}
                  component="a"
                  href="#"
                  aria-label={s.label}
                  sx={{
                    width: 40, height: 40, borderRadius: '12px',
                    bgcolor: '#fff', border: '1px solid #e5e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#5b6280', textDecoration: 'none',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#1A1F3C', color: '#fff', borderColor: '#1A1F3C', transform: 'translateY(-2px)' },
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" dangerouslySetInnerHTML={{ __html: s.svg }} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <Box key={col.title}>
              <Typography sx={{
                fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em',
                color: '#1A1F3C', mb: '16px',
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
              }}>
                {col.title}
              </Typography>
              {col.links.map(([label, href]) => (
                <Box key={label} sx={{ mb: '11px' }}>
                  <Typography
                    component={Link}
                    to={href}
                    sx={{
                      fontSize: '14.5px', color: '#5b6280',
                      textDecoration: 'none',
                      transition: 'color 0.14s',
                      '&:hover': { color: '#1f5bd1' },
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {/* ── Bottom bar ── */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
            pt: '24px', borderTop: '1px solid #e5e8f0',
          }}
        >
          <Typography sx={{ fontSize: '13.5px', color: '#767d97' }}>
            © {new Date().getFullYear()} AssetMaster Inc. Усі права захищені.
          </Typography>
          <Box sx={{ display: 'flex', gap: '22px' }}>
            {[['Конфіденційність', '/'], ['Умови', '/licenses'], ['Cookies', '/']].map(([label, href]) => (
              <Typography
                key={label}
                component={Link}
                to={href}
                sx={{ fontSize: '13.5px', color: '#767d97', textDecoration: 'none', '&:hover': { color: '#1A1F3C' } }}
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
