import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  useAdminFinance,
  useAdminPayouts,
  useTriggerPayout,
  useUpdatePayoutStatus,
} from '../../features/admin-panel/useAdmin'
import type { PayoutDto, TriggerPayoutRequest } from '../../features/admin-panel/adminApi'

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  PAID:       { label: 'Виплачено',  color: 'success' },
  PENDING:    { label: 'Очікує',     color: 'warning' },
  PROCESSING: { label: 'В обробці',  color: 'info' },
  FAILED:     { label: 'Помилка',    color: 'error' },
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card sx={{ flex: '1 1 180px' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

function TriggerPayoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<TriggerPayoutRequest>({
    authorId: 0, amount: 0, periodStart: '', periodEnd: '', notes: '',
  })
  const [error, setError] = useState('')
  const trigger = useTriggerPayout()

  function set<K extends keyof TriggerPayoutRequest>(k: K, v: TriggerPayoutRequest[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit() {
    if (!form.authorId || !form.amount || !form.periodStart || !form.periodEnd) {
      setError('Заповніть усі обов\'язкові поля'); return
    }
    try {
      await trigger.mutateAsync(form)
      onClose()
    } catch {
      setError('Помилка створення виплати')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Створити виплату</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        <TextField label="ID автора" type="number" value={form.authorId || ''} onChange={e => set('authorId', Number(e.target.value))} fullWidth required />
        <TextField label="Сума ($)" type="number" value={form.amount || ''} onChange={e => set('amount', Number(e.target.value))} fullWidth required inputProps={{ step: '0.01', min: '0.01' }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Початок періоду" type="date" value={form.periodStart} onChange={e => set('periodStart', e.target.value)} fullWidth required slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Кінець періоду" type="date" value={form.periodEnd} onChange={e => set('periodEnd', e.target.value)} fullWidth required slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
        <TextField label="Примітки" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} fullWidth multiline rows={2} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={trigger.isPending}>Скасувати</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={trigger.isPending}>Створити</Button>
      </DialogActions>
    </Dialog>
  )
}

function PayoutsTab() {
  const [page] = useState(0)
  const { data, isLoading } = useAdminPayouts(page)
  const updateStatus = useUpdatePayoutStatus()
  const [dialogOpen, setDialogOpen] = useState(false)

  const payouts = data?.content ?? []

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Нова виплата
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>ID</TableCell>
              <TableCell>Автор</TableCell>
              <TableCell>Період</TableCell>
              <TableCell align="right">Сума</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Примітки</TableCell>
              <TableCell align="center">Дія</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
              </TableRow>
            ))}
            {!isLoading && payouts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Виплат ще немає</TableCell>
              </TableRow>
            )}
            {!isLoading && payouts.map((p: PayoutDto) => {
              const s = STATUS_CHIP[p.status] ?? { label: p.status, color: 'default' as const }
              return (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>{p.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{p.authorName}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {p.periodStart} — {p.periodEnd}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>${Number(p.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.notes ?? '—'}
                  </TableCell>
                  <TableCell align="center">
                    {p.status !== 'PAID' && p.status !== 'FAILED' && (
                      <Tooltip title="Змінити статус">
                        <Select
                          size="small"
                          value={p.status}
                          onChange={e => updateStatus.mutate({ id: p.id, status: e.target.value })}
                          sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: 0.25, px: 1 } }}
                          IconComponent={SwapHorizIcon}
                        >
                          <MenuItem value="PENDING">Очікує</MenuItem>
                          <MenuItem value="PROCESSING">В обробці</MenuItem>
                          <MenuItem value="PAID">Виплачено</MenuItem>
                          <MenuItem value="FAILED">Помилка</MenuItem>
                        </Select>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TriggerPayoutDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  )
}

export default function AdminFinancePage() {
  const { data, isLoading } = useAdminFinance()
  const [tab, setTab] = useState(0)

  const chartData = data
    ? [...data.monthly].reverse().map(m => ({
        month: m.month, orders: m.orders, revenue: Number(m.revenue),
      }))
    : []

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
      <Typography variant="h2" sx={{ mb: 4 }}>Фінанси</Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} sx={{ flex: '1 1 180px' }}>
              <CardContent><Skeleton width={80} /><Skeleton width={100} height={40} /></CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Загальний дохід" value={`$${Number(data?.totalRevenue ?? 0).toFixed(2)}`} sub="всі часи" />
            <StatCard label="Дохід цього місяця" value={`$${Number(data?.monthRevenue ?? 0).toFixed(2)}`} />
            <StatCard label="Оплачених замовлень" value={String(data?.totalOrders ?? 0)} />
          </>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label="Огляд" />
        <Tab label="Виплати авторам" />
      </Tabs>

      {tab === 0 && (
        <>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Дохід за місяцями</Typography>
            {isLoading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            ) : chartData.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>Даних поки немає</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1aa06a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1aa06a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartTooltip formatter={(v: number, n: string) => n === 'revenue' ? [`$${v.toFixed(2)}`, 'Дохід'] : [v, 'Замовлень']} />
                  <Area type="monotone" dataKey="revenue" stroke="#1aa06a" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e5e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Топ-10 авторів за доходом</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Автор</TableCell>
                    <TableCell align="right">Продажів</TableCell>
                    <TableCell align="right">Дохід</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                        </TableRow>
                      ))
                    : data?.topAuthors.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Продажів ще не було</TableCell>
                      </TableRow>
                    )
                    : data?.topAuthors.map((a, i) => (
                      <TableRow key={a.authorId} hover>
                        <TableCell sx={{ color: 'text.disabled', fontWeight: 600 }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{a.displayName}</TableCell>
                        <TableCell align="right">{a.sales}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                          ${Number(a.earnings).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {tab === 1 && <PayoutsTab />}
    </Box>
  )
}
