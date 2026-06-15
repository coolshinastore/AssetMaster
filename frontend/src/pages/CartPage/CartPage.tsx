import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { useCart } from '../../features/cart/CartContext'

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ flex: 1, maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Typography variant="h2" sx={{ mb: 4 }}>Кошик</Typography>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'flex-start' }}>

            {/* Items list */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="text.secondary">{items.length} {items.length === 1 ? 'актив' : 'активів'}</Typography>
                <Button size="small" color="error" onClick={clearCart}>Очистити кошик</Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((item) => (
                  <Box
                    key={`${item.id}-${item.licenseType}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      border: '1px solid #e5e8f0',
                      borderRadius: 3,
                      bgcolor: 'white',
                    }}
                  >
                    <Box component={Link} to={`/assets/${item.id}`} sx={{ flexShrink: 0, textDecoration: 'none' }}>
                      <Avatar
                        src={item.thumbnailUrl ?? undefined}
                        variant="rounded"
                        sx={{ width: 80, height: 50, borderRadius: 2 }}
                      >
                        {item.title[0]}
                      </Avatar>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component={Link}
                        to={`/assets/${item.id}`}
                        variant="body1"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          textDecoration: 'none',
                          color: 'text.primary',
                          display: 'block',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{item.authorName}</Typography>
                      <Chip
                        label={item.licenseType === 'STANDARD' ? 'Стандартна' : 'Комерційна'}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>

                    <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem', flexShrink: 0 }}>
                      ${item.price}
                    </Typography>

                    <IconButton onClick={() => removeItem(item.id)} size="small" color="error" title="Видалити">
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Order summary */}
            <Box
              sx={{
                width: { lg: 320 },
                flexShrink: 0,
                position: { lg: 'sticky' },
                top: 80,
                border: '1px solid #e5e8f0',
                borderRadius: 3,
                p: 3,
                bgcolor: 'white',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Підсумок замовлення</Typography>

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

              <Button
                component={Link}
                to="/checkout"
                variant="contained"
                size="large"
                fullWidth
              >
                Оформити замовлення
              </Button>
              <Button
                component={Link}
                to="/catalog"
                variant="text"
                size="small"
                fullWidth
                sx={{ mt: 1.5, color: 'text.secondary' }}
              >
                Продовжити покупки
              </Button>
            </Box>
          </Box>
        )}
      </Box>

    </Box>
  )
}

function EmptyCart() {
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 1 }}>Кошик порожній</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Додайте активи з каталогу, щоб оформити замовлення
      </Typography>
      <Button component={Link} to="/catalog" variant="contained" size="large">
        Перейти до каталогу
      </Button>
    </Box>
  )
}
