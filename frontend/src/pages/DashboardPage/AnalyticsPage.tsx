import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useAnalytics } from '../../features/analytics/useAnalytics'

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics()

  const chartData = data
    ? [...data.monthlySales].reverse().map(m => ({
        month: m.month,
        sales: m.salesCount,
        earnings: Number(m.earnings),
      }))
    : []

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
        Аналітика продажів
      </Typography>

      {/* Stats cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Загальний дохід</Typography>
            {isLoading
              ? <Skeleton width={80} height={36} />
              : <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ${Number(data?.totalEarnings ?? 0).toFixed(2)}
                </Typography>}
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Продажів</Typography>
            {isLoading
              ? <Skeleton width={60} height={36} />
              : <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {data?.totalSales ?? 0}
                </Typography>}
          </CardContent>
        </Card>
      </Box>

      {/* Monthly chart */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
          Продажі за місяцями
        </Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
        ) : chartData.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
            Даних поки немає
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'earnings' ? [`$${value.toFixed(2)}`, 'Дохід'] : [value, 'Продажів']
                }
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#earningsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Top assets table */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e5e8f0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Топ активи
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Назва</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Продажів</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Дохід</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                : data?.topAssets.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Продажів ще не було
                    </TableCell>
                  </TableRow>
                )
                : data?.topAssets.map(asset => (
                  <TableRow key={asset.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {asset.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{asset.salesCount}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${Number(asset.earnings).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
