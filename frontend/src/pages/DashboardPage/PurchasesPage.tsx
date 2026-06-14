import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import DownloadIcon from '@mui/icons-material/Download'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useOrders } from '../../entities/order/api/useOrders'
import { fetchDownloadUrl } from '../../entities/order/api/orderApi'

export default function PurchasesPage() {
  const { data: orders, isLoading } = useOrders()

  const handleDownload = async (orderId: number, assetId: number) => {
    try {
      const { url } = await fetchDownloadUrl(orderId, assetId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // handled silently
    }
  }

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Typography variant="h2" sx={{ mb: 4 }}>Мої покупки</Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>Покупок поки немає</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Придбайте активи з каталогу
            </Typography>
            <Button component={Link} to="/catalog" variant="contained" size="large">
              Перейти до каталогу
            </Button>
          </Box>
        )}

        {orders && orders.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {orders.map((order) => (
              <Box
                key={order.id}
                sx={{ border: '1px solid #e5e8f0', borderRadius: 3, overflow: 'hidden', bgcolor: 'white' }}
              >
                {/* Order header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: '#f8f9fc',
                    borderBottom: '1px solid #e5e8f0',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Замовлення #{order.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={order.status === 'PAID' ? 'Оплачено' : order.status}
                      size="small"
                      color={order.status === 'PAID' ? 'success' : 'default'}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      ${Number(order.totalAmount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Items */}
                <Box>
                  {order.items.map((item) => (
                    <Box
                      key={item.assetId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderBottom: '1px solid #f1f3f9',
                        '&:last-child': { borderBottom: 'none' },
                        flexWrap: 'wrap',
                      }}
                    >
                      <Avatar
                        src={item.thumbnailUrl ?? undefined}
                        variant="rounded"
                        sx={{ width: 64, height: 40, borderRadius: 1.5, flexShrink: 0 }}
                      >
                        {item.assetTitle[0]}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 160 }}>
                        <Typography
                          component={Link}
                          to={`/assets/${item.assetId}`}
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', display: 'block', '&:hover': { color: 'primary.main' } }}
                        >
                          {item.assetTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">{item.authorName}</Typography>
                          <Chip
                            label={item.licenseType === 'STANDARD' ? 'Стандартна' : 'Комерційна'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      </Box>

                      <Typography sx={{ fontWeight: 600, color: 'primary.main', flexShrink: 0, fontSize: '0.9rem' }}>
                        ${item.priceAtPurchase}
                      </Typography>

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(order.id, item.assetId)}
                        sx={{ flexShrink: 0 }}
                      >
                        Завантажити
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
    </Box>
  )
}
