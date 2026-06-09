import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import Navbar from '../../widgets/Navbar/Navbar'
import Footer from '../../widgets/Footer/Footer'
import { useCart } from '../../features/cart/CartContext'
import { fetchDownloadUrl } from '../../entities/order/api/orderApi'
import type { OrderItemDto } from '../../entities/order/types'

export default function CheckoutSuccessPage() {
  const { state } = useLocation()
  const { clearCart } = useCart()
  const orderId: number | undefined = (state as { orderId?: number } | null)?.orderId
  const items: OrderItemDto[] | undefined = (state as { items?: OrderItemDto[] } | null)?.items

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { clearCart() }, [])

  const handleDownload = async (assetId: number) => {
    if (!orderId) return
    try {
      const { url } = await fetchDownloadUrl(orderId, assetId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // handled silently — user can retry
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ flex: 1, maxWidth: 800, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 8, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />

        <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, mb: 1 }}>
          Замовлення оформлено!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 0.5 }}>
          Замовлення #{orderId ?? '—'} успішно підтверджено
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 5, fontSize: '0.9rem' }}>
          Завантажте ваші активи нижче або знайдіть їх у розділі «Мої покупки»
        </Typography>

        {items && items.length > 0 && (
          <Box sx={{ textAlign: 'left', mb: 6 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Завантажити активи</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((item) => (
                <Box
                  key={item.assetId}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e8f0', borderRadius: 3, bgcolor: 'white' }}
                >
                  <Avatar src={item.thumbnailUrl ?? undefined} variant="rounded" sx={{ width: 72, height: 45, borderRadius: 2 }}>
                    {item.assetTitle[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{item.assetTitle}</Typography>
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
                    ${item.priceAtPurchase}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(item.assetId)}
                    sx={{ flexShrink: 0 }}
                  >
                    Завантажити
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={Link} to="/dashboard/purchases" variant="contained">
            Мої покупки
          </Button>
          <Button component={Link} to="/catalog" variant="outlined">
            Продовжити покупки
          </Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
