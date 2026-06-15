import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import DownloadDoneOutlinedIcon from '@mui/icons-material/DownloadDoneOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
const STATS = [
  { icon: <StorefrontOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />, value: '180K+', label: 'Активів у каталозі' },
  { icon: <GroupsOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />, value: '12K+', label: 'Авторів з усього світу' },
  { icon: <StarOutlinedIcon sx={{ fontSize: 36, color: 'warning.main' }} />, value: '4.9★', label: 'Середній рейтинг' },
  { icon: <DownloadDoneOutlinedIcon sx={{ fontSize: 36, color: 'success.main' }} />, value: '8.2M', label: 'Завантажень' },
]

const TEAM = [
  { name: 'Команда продукту', role: 'Розробка та дизайн платформи' },
  { name: 'Команда модерації', role: 'Перевірка якості активів' },
  { name: 'Команда підтримки', role: 'Допомога авторам і покупцям' },
]

export default function AboutPage() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip label="Про нас" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Маркетплейс для тих,<br />хто створює і купує
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}>
            AssetMaster — двосторонній маркетплейс цифрових активів, де автори монетизують
            свої роботи, а покупці знаходять якісні ресурси для проєктів.
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mb: 8 }}>
          {STATS.map(s => (
            <Paper key={s.label} variant="outlined" sx={{ p: 3, textAlign: 'center', flex: '1 1 160px', borderRadius: 3 }}>
              {s.icon}
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ mb: 6 }} />

        {/* Mission */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Наша місія</Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
            Ми створили AssetMaster, щоб усунути бар'єри між авторами та командами.
            Прозора комісія 15–25 %, швидка модерація та україномовна підтримка —
            це наші ключові відмінності від іноземних конкурентів.
          </Typography>
        </Box>

        {/* Team */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Наша команда</Typography>
        <Grid container spacing={2}>
          {TEAM.map(t => (
            <Grid item xs={12} sm={4} key={t.name}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t.role}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
  )
}
