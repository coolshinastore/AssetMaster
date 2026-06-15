import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined'
import { useAuth } from '../../features/auth/AuthContext'
import { useMyPayouts } from '../../features/analytics/usePayouts'
import { useStripeConnectStatus, useStartStripeOnboarding } from '../../features/stripe/useStripe'

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'error' | 'default' }> = {
  PAID:       { label: 'Виплачено',  color: 'success' },
  PENDING:    { label: 'Очікує',     color: 'warning' },
  PROCESSING: { label: 'В обробці',  color: 'info' },
  FAILED:     { label: 'Помилка',    color: 'error' },
}

function PayoutsHistory() {
  const { data: payouts, isLoading } = useMyPayouts()

  const total = payouts?.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0) ?? 0
  const pending = payouts?.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((s, p) => s + Number(p.amount), 0) ?? 0

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceOutlinedIcon color="action" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Виплати роялті</Typography>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 140, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">Отримано всього</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
            ${total.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 140, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">Очікується</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
            ${pending.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Період</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Сума</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Примітки</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
              </TableRow>
            ))}
            {!isLoading && (!payouts || payouts.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Виплат ще не було. Мінімальний поріг: $50.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && payouts?.map(p => {
              const s = STATUS_CHIP[p.status] ?? { label: p.status, color: 'default' as const }
              const period = `${new Date(p.periodStart).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}`
              return (
                <TableRow key={p.id} hover>
                  <TableCell>{period}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>${Number(p.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{p.notes ?? '—'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

function StripeConnectSection() {
  const { data: status, isLoading } = useStripeConnectStatus()
  const onboard = useStartStripeOnboarding()

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">Перевірка статусу Stripe...</Typography>
      </Paper>
    )
  }

  if (!status?.enabled) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LinkOutlinedIcon color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Stripe Connect</Typography>
          <Chip label="Не налаштовано" size="small" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Stripe не підключено на сервері. Зверніться до адміністратора для налаштування STRIPE_SECRET_KEY.
        </Typography>
      </Paper>
    )
  }

  if (status.onboardingComplete) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, borderColor: 'success.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircleOutlinedIcon color="success" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Stripe Connect</Typography>
          <Chip label="Підключено" color="success" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Ваш Stripe рахунок підключено та верифіковано. Адміністратор може виконувати виплати напряму на ваш рахунок через Stripe Transfer.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <LinkOutlinedIcon color="action" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Stripe Connect</Typography>
        {status.connected
          ? <Chip label="Онбординг не завершено" color="warning" size="small" />
          : <Chip label="Не підключено" size="small" variant="outlined" />
        }
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {status.connected
          ? 'Ви розпочали реєстрацію в Stripe, але не завершили. Продовжіть налаштування, щоб отримувати виплати.'
          : 'Підключіть свій Stripe рахунок, щоб отримувати виплати роялті напряму на банківський рахунок.'
        }
      </Typography>
      <Button
        variant="contained"
        startIcon={onboard.isPending ? <CircularProgress size={16} color="inherit" /> : <LinkOutlinedIcon />}
        disabled={onboard.isPending}
        onClick={() => onboard.mutate()}
      >
        {status.connected ? 'Завершити налаштування Stripe' : 'Підключити Stripe'}
      </Button>
      <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
        Ви будете перенаправлені на захищену сторінку Stripe для верифікації.
      </Typography>
    </Paper>
  )
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const isAuthor = user?.role === 'ROLE_AUTHOR' || user?.role === 'ROLE_ADMIN'
  const stripeReturn = searchParams.get('stripe')

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>Платіжні реквізити</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Налаштуйте спосіб отримання виплат та збережені методи оплати.
      </Typography>

      {stripeReturn === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Stripe onboarding завершено! Ваш рахунок перевіряється. Статус оновиться автоматично.
        </Alert>
      )}
      {stripeReturn === 'refresh' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Посилання для onboarding застаріло. Натисніть "Підключити Stripe" ще раз.
        </Alert>
      )}

      {/* Demo notice */}
      <Box
        sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1.5,
          bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main',
          borderRadius: 2, p: 2, mb: 4,
        }}
      >
        <InfoOutlinedIcon fontSize="small" color="primary" sx={{ mt: 0.25 }} />
        <Typography variant="body2" color="primary.dark">
          Stripe Connect активний. Для виплат через Stripe автор повинен пройти Express onboarding.
        </Typography>
      </Box>

      {/* Stripe Connect — authors only */}
      {isAuthor && <StripeConnectSection />}

      {/* Payout history — authors only */}
      {isAuthor && <PayoutsHistory />}

      {/* Payout requisites */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccountBalanceOutlinedIcon color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Реквізити для виплат</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isAuthor
            ? 'Виплати проводяться щомісяця після досягнення мінімального порогу $50.'
            : 'Реквізити для відшкодувань при поверненні коштів.'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="PayPal email" placeholder="your@paypal.com" fullWidth disabled />
          <TextField label="IBAN (банківський рахунок)" placeholder="UA000000000000000000000000000" fullWidth disabled />
          <TextField label="Отримувач" placeholder="Іваненко Іван Іванович" fullWidth disabled />
        </Box>
        <Button variant="contained" sx={{ mt: 2 }} disabled>
          Зберегти реквізити
        </Button>
      </Paper>

      {/* Saved payment methods */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CreditCardOutlinedIcon color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Збережені методи оплати</Typography>
        </Box>
        <Box
          sx={{
            border: '1px dashed', borderColor: 'divider', borderRadius: 2,
            p: 3, textAlign: 'center', bgcolor: 'background.default',
          }}
        >
          <CreditCardOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Немає збережених карток</Typography>
          <Button variant="outlined" size="small" disabled>Додати картку</Button>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay'].map(m => (
            <Chip key={m} label={m} size="small" variant="outlined" sx={{ color: 'text.secondary' }} />
          ))}
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          Підтримувані методи оплати (активуються після підключення платіжного шлюзу)
        </Typography>
      </Paper>
    </Box>
  )
}
