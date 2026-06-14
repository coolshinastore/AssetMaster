import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import AssetCard from '../../entities/asset/ui/AssetCard'
import { useWishlist } from '../../features/wishlist/useWishlist'

export default function WishlistPage() {
  const { data: items, isLoading } = useWishlist()

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Typography variant="h2" sx={{ mb: 4 }}>Список бажань</Typography>

        {isLoading && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
              gap: 3,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => <AssetCard key={i} isLoading />)}
          </Box>
        )}

        {!isLoading && (!items || items.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <FavoriteBorderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>Список бажань порожній</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Натисніть ❤ на картці активу, щоб зберегти його тут
            </Typography>
            <Button component={Link} to="/catalog" variant="contained" size="large">
              Перейти до каталогу
            </Button>
          </Box>
        )}

        {items && items.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
              gap: 3,
            }}
          >
            {items.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </Box>
        )}
    </Box>
  )
}
