import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'

export default function MaintenancePage() {
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
      <BuildOutlinedIcon sx={{ fontSize: 72, color: 'warning.main', mb: 3 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
        Технічне обслуговування
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 420 }}>
        AssetMaster тимчасово недоступний у зв'язку з плановими технічними роботами.
        Ми скоро повернемося!
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Слідкуйте за оновленнями у наших соціальних мережах.
      </Typography>
    </Box>
  )
}
