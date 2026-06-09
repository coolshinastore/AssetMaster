import { Link, useNavigate } from 'react-router-dom'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { useAuth } from '../../../features/auth/AuthContext'
import { useToggleWishlist } from '../../../features/wishlist/useWishlist'
import type { AssetSummaryDto } from '../types'

interface Props {
  asset?: AssetSummaryDto
  isLoading?: boolean
}

export default function AssetCard({ asset, isLoading }: Props) {
  if (isLoading || !asset) return <AssetCardSkeleton />
  return <AssetCardContent asset={asset} />
}

function AssetCardContent({ asset }: { asset: AssetSummaryDto }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toggle, isInWishlist } = useToggleWishlist()
  const inWishlist = !!user && isInWishlist(asset.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/auth/login')
    } else {
      toggle(asset.id)
    }
  }

  return (
    <Link to={`/assets/${asset.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        sx={{
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px rgba(26,31,60,0.12)',
            borderColor: 'transparent',
            '& .card-overlay': { opacity: 1 },
            '& .preview-btn': { transform: 'translateY(0)' },
            '& .wish-icon': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Thumbnail */}
        <Box sx={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', bgcolor: '#f1f3f9' }}>
          {asset.thumbnailUrl ? (
            <Box
              component="img"
              src={asset.thumbnailUrl}
              alt={asset.title}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: '#e5e8f0' }} />
          )}

          {/* Hover overlay */}
          <Box
            className="card-overlay"
            sx={{
              position: 'absolute', inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Button
              className="preview-btn"
              variant="contained"
              size="small"
              sx={{
                transform: 'translateY(8px)',
                transition: 'transform 0.2s ease-in-out',
                pointerEvents: 'none',
              }}
            >
              Переглянути
            </Button>
          </Box>

          {/* Wishlist icon — always visible when in wishlist, otherwise hover-only */}
          <IconButton
            className="wish-icon"
            size="small"
            onClick={handleWishlistClick}
            sx={{
              position: 'absolute', top: 8, right: 8,
              opacity: inWishlist ? 1 : 0,
              transform: inWishlist ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' },
            }}
          >
            {inWishlist
              ? <FavoriteIcon sx={{ fontSize: 16, color: '#f2547d' }} />
              : <FavoriteBorderIcon sx={{ fontSize: 16 }} />
            }
          </IconButton>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {asset.categoryName && (
            <Chip
              label={asset.categoryName}
              size="small"
              sx={{ mb: 1, fontSize: '0.7rem', height: 20, maxWidth: '100%' }}
            />
          )}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}
          >
            {asset.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 1 }}>
            {asset.authorName}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>
            ${asset.price}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  )
}

function AssetCardSkeleton() {
  return (
    <Card>
      <Box sx={{ aspectRatio: '16/10' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Skeleton width={60} height={20} sx={{ mb: 1 }} />
        <Skeleton width="80%" height={18} />
        <Skeleton width="50%" height={16} sx={{ mt: 0.5 }} />
        <Skeleton width={50} height={20} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  )
}
