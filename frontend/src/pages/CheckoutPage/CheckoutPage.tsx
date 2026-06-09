import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import Navbar from '../../widgets/Navbar/Navbar'
import Footer from '../../widgets/Footer/Footer'
import { useCart } from '../../features/cart/CartContext'
import { useCreateOrder } from '../../entities/order/api/useOrders'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const { mutate: createOrder, isPending, error } = useCreateOrder()

  const handleCheckout = () => {
    if (items.length === 0) return
    createOrder(
      { items: items.map(i => ({ assetId: i.id, licenseType: i.licenseType })) },
      {
        onSuccess: (order) => {
          clearCart()
          navigate('/checkout/success', { state: { orderId: order.id, items: order.items } })
        },
      },
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h5">Кошик порожній</Typography>
          <Button component={Link} to="/catalog" variant="contained">Перейти до каталогу</Button>
        </Box>
        <Footer />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ flex: 1, maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Typography variant="h2" sx={{ mb: 4 }}>Оформлення замовлення</Typography>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'flex-start' }}>

          {/* Order items */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Активи ({items.length})</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((item) => (
                <Box
                  key={`${item.id}-${item.licenseType}`}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e8f0', borderRadius: 3, bgcolor: 'white' }}
                >
                  <Avatar src={item.thumbnailUrl ?? undefined} variant="rounded" sx={{ width: 72, height: 45, borderRadius: 2 }}>
                    {item.title[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.authorName}</Typography>
                    <Box>
                      <Chip
                        label={item.licenseType === 'STANDARD' ? 'Стандартна' : 'Комерційна'}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
                    ${item.price}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Payment panel */}
          <Box
            sx={{
              width: { lg: 340 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: 80,
              border: '1px solid #e5e8f0',
              borderRadius: 3,
              p: 3,
              bgcolor: 'white',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Оплата</Typography>

            <Alert severity="info" sx={{ mb: 3, fontSize: '0.8rem' }}>
              Demo-режим: реальна оплата не стягується. Замовлення буде підтверджено автоматично.
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary">Активів</Typography>
              <Typography>{items.length}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography sx={{ fontWeight: 700 }}>Разом</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: 'primary.main' }}>
                ${total.toFixed(2)}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>Помилка при оформленні замовлення</Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckout}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isPending ? 'Обробка...' : 'Підтвердити замовлення'}
            </Button>
            <Button
              component={Link}
              to="/cart"
              variant="text"
              size="small"
              fullWidth
              sx={{ mt: 1.5, color: 'text.secondary' }}
            >
              ← Повернутись до кошика
            </Button>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
