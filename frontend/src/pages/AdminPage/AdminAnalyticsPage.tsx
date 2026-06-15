import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAdminPlatformAnalytics } from '../../features/admin-panel/useAdmin'

const CATEGORY_COLORS = ['#3B82F6', '#1aa06a', '#f5a623', '#f2547d', '#8b5cf6', '#06b6d4', '#84cc16']

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card sx={{ flex: '1 1 150px' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminPlatformAnalytics()

  const monthlyChart = data ? [...data.monthly].reverse() : []

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
      <Typography variant="h2" sx={{ mb: 4 }}>Аналітика платформи</Typography>

      {/* KPI cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} sx={{ flex: '1 1 150px' }}>
              <CardContent><Skeleton width={80} /><Skeleton width={100} height={40} /></CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Користувачів" value={String(data?.totalUsers ?? 0)} />
            <StatCard label="Активів" value={String(data?.totalAssets ?? 0)} sub={`${data?.publishedAssets} опубліковано`} />
            <StatCard label="Замовлень (PAID)" value={String(data?.totalOrders ?? 0)} />
            <StatCard label="Загальний дохід" value={`$${Number(data?.totalRevenue ?? 0).toFixed(2)}`} />
          </>
        )}
      </Box>

      {/* Monthly revenue + users chart */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Дохід і нові користувачі за місяцями</Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
        ) : monthlyChart.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>Даних поки немає</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1aa06a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1aa06a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number, n: string) => {
                  if (n === 'revenue') return [`$${v.toFixed(2)}`, 'Дохід']
                  if (n === 'newUsers') return [v, 'Нових користувачів']
                  return [v, n]
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#revGradAdmin)" />
              <Area yAxisId="right" type="monotone" dataKey="newUsers" stroke="#1aa06a" strokeWidth={2} fill="url(#usersGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Top categories bar chart */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Топ категорій за кількістю активів</Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        ) : !data?.topCategories.length ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Немає даних</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.topCategories} layout="vertical" margin={{ top: 0, right: 8, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(v: number) => [v, 'Активів']} />
              <Bar dataKey="assetCount" radius={[0, 4, 4, 0]}>
                {data.topCategories.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  )
}
