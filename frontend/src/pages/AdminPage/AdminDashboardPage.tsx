import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { useAdminStats } from '../../features/admin-panel/useAdmin'

interface StatCardProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  color: string
  onClick?: () => void
}

function StatCard({ label, value, icon, color, onClick }: StatCardProps) {
  const content = (
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
      <Box
        sx={{
          width: 52, height: 52, borderRadius: 2,
          bgcolor: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value === undefined ? <Skeleton width={60} /> : value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  )

  return (
    <Card>
      {onClick ? (
        <CardActionArea onClick={onClick}>{content}</CardActionArea>
      ) : content}
    </Card>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: stats } = useAdminStats()

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Адмін панель
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Огляд платформи AssetMaster
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            label="Користувачів"
            value={stats?.totalUsers}
            icon={<PeopleOutlinedIcon />}
            color="#3B82F6"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            label="Активів загалом"
            value={stats?.totalAssets}
            icon={<InventoryOutlinedIcon />}
            color="#1aa06a"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            label="На модерації"
            value={stats?.pendingAssets}
            icon={<PendingActionsOutlinedIcon />}
            color="#f5a623"
            onClick={() => navigate('/admin/moderation')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            label="Опублікованих"
            value={stats?.publishedAssets}
            icon={<CheckCircleOutlinedIcon />}
            color="#1aa06a"
          />
        </Grid>
      </Grid>
    </Box>
  )
}
