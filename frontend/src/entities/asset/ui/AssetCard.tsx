import { Link, useNavigate } from 'react-router-dom'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { useAuth } from '../../../features/auth/AuthContext'
import { useToggleWishlist } from '../../../features/wishlist/useWishlist'
import { useCart } from '../../../features/cart/CartContext'
import type { AssetSummaryDto } from '../types'

const CAT_META: Record<string, { grad: string; tag: string; glyph: string }> = {
  '3D-моделі':   { grad: 'linear-gradient(135deg,#6d4bd4,#3a2a7a)', tag: '3D MODEL',  glyph: '3D' },
  'UI Kits':     { grad: 'linear-gradient(135deg,#3B82F6,#1f3d8f)', tag: 'UI KIT',    glyph: 'UI' },
  'Шрифти':      { grad: 'linear-gradient(135deg,#475178,#22273f)', tag: 'FONT',       glyph: 'Aa' },
  'Ілюстрації':  { grad: 'linear-gradient(135deg,#f0764e,#b23a52)', tag: 'ILLUSTR.',   glyph: 'IL' },
  'Відео':       { grad: 'linear-gradient(135deg,#2fa6c4,#1d5e8f)', tag: 'VIDEO',      glyph: 'VD' },
  'Аудіо':       { grad: 'linear-gradient(135deg,#27a06a,#176b54)', tag: 'AUDIO',      glyph: 'AU' },
  'Game Assets': { grad: 'linear-gradient(135deg,#e0a23c,#a85f24)', tag: 'GAME',       glyph: 'GA' },
}
const DEFAULT_GRAD = 'linear-gradient(135deg,#475178,#22273f)'

function fmtDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

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
  const { addItem, isInCart } = useCart()
  const inWishlist = !!user && isInWishlist(asset.id)
  const alreadyInCart = isInCart(asset.id)

  const catKey = asset.categoryName ?? ''
  const meta = CAT_META[catKey]
  const grad = meta?.grad ?? DEFAULT_GRAD
  const tag = meta?.tag ?? (catKey.toUpperCase() || 'ASSET')
  const glyph = meta?.glyph ?? ''

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/auth/login'); return }
    toggle(asset.id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (alreadyInCart) { navigate('/cart'); return }
    addItem({
      id: asset.id,
      title: asset.title,
      thumbnailUrl: asset.thumbnailUrl,
      authorName: asset.authorName ?? '',
      price: asset.price,
      licenseType: asset.licenseType,
    })
  }

  return (
    <Link to={`/assets/${asset.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        sx={{
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 18px 48px rgba(26,31,60,0.14)',
            borderColor: 'transparent',
            '& .card-overlay': { opacity: 1 },
            '& .preview-btn': { transform: 'translateY(0)' },
            '& .wish-icon': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* ── Thumbnail ── */}
        <Box sx={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', flexShrink: 0 }}>
          {asset.thumbnailUrl ? (
            <Box
              component="img"
              src={asset.thumbnailUrl}
              alt={asset.title}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', background: grad, position: 'relative' }}>
              <Box sx={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }} />
            </Box>
          )}

          {/* Category badge — top-left */}
          <Box sx={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.04em',
            textTransform: 'uppercase', color: '#fff',
            bgcolor: 'rgba(26,31,60,0.55)',
            backdropFilter: 'blur(4px)',
            px: '8px', py: '4px', borderRadius: '6px',
            lineHeight: 1.4,
          }}>
            {tag}
          </Box>

          {/* Category glyph watermark — bottom-right */}
          {glyph && (
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute', right: 14, bottom: 10, zIndex: 1,
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                fontSize: '30px', color: 'rgba(255,255,255,0.30)',
                letterSpacing: '-0.02em', pointerEvents: 'none', lineHeight: 1,
              }}
            >
              {glyph}
            </Box>
          )}

          {/* Hover overlay */}
          <Box
            className="card-overlay"
            sx={{
              position: 'absolute', inset: 0, zIndex: 3,
              bgcolor: 'rgba(0,0,0,0.40)', opacity: 0,
              transition: 'opacity 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Box
              className="preview-btn"
              sx={{
                bgcolor: '#fff', color: '#1A1F3C',
                fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '14px',
                px: '18px', py: '10px', borderRadius: '999px',
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                transform: 'translateY(8px)', transition: 'transform 0.2s ease',
                boxShadow: '0 8px 24px rgba(26,31,60,0.10)',
              }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
              Preview
            </Box>
          </Box>

          {/* Wishlist button */}
          <IconButton
            className="wish-icon"
            size="small"
            onClick={handleWishlistClick}
            aria-label="Додати у список бажань"
            aria-pressed={inWishlist}
            sx={{
              position: 'absolute', top: 8, right: 8, zIndex: 4,
              width: 36, height: 36,
              opacity: inWishlist ? 1 : 0,
              transform: inWishlist ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease, color 0.15s, background 0.15s',
              bgcolor: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 6px rgba(26,31,60,0.07)',
              '&:hover': { bgcolor: '#fff', color: '#f2547d' },
            }}
          >
            {inWishlist
              ? <FavoriteIcon sx={{ fontSize: 18, color: '#f2547d' }} />
              : <FavoriteBorderIcon sx={{ fontSize: 18 }} />
            }
          </IconButton>
        </Box>

        {/* ── Card body ── */}
        <Box sx={{ p: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {/* Title */}
          <Typography sx={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '16px',
            color: '#1A1F3C', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {asset.title}
          </Typography>

          {/* Author */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #5b9bff, #1A1F3C)',
            }} />
            <Box component="span" sx={{ fontSize: '13.5px', color: '#5b6280', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {asset.authorName ?? 'Автор'}
              {asset.authorVerified && (
                <Box component="span" sx={{ display: 'inline-flex', color: '#3B82F6', width: 14, height: 14, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified Author">
                    <path d="m9.5 12 1.8 1.8 3.6-3.8M12 2l2.4 1.8 3-.2 1 2.8 2.4 1.7-.8 2.9.8 2.9-2.4 1.7-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3.2 16l.8-2.9L3.2 10l2.4-1.7 1-2.8 3 .2L12 2Z"/>
                  </svg>
                </Box>
              )}
            </Box>
          </Box>

          {/* Meta: downloads + category */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#767d97' }}>
            {asset.downloadsCount > 0 && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <DownloadOutlinedIcon sx={{ fontSize: 14 }} />
                {fmtDownloads(asset.downloadsCount)}
              </Box>
            )}
            {asset.categoryName && (
              <Box sx={{ ml: 'auto', color: '#9aa0b6', fontSize: '13px' }}>
                {asset.categoryName}
              </Box>
            )}
          </Box>

          {/* Footer: price + add-to-cart */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            mt: 'auto', pt: '12px', borderTop: '1px solid #e5e8f0',
          }}>
            <Typography sx={{
              fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '18px',
              color: asset.price === 0 ? '#1aa06a' : '#1A1F3C',
            }}>
              {asset.price === 0 ? 'Безкоштовно' : `$${asset.price}`}
            </Typography>

            <IconButton
              size="small"
              onClick={handleAddToCart}
              aria-label="Додати в кошик"
              sx={{
                width: 38, height: 38, borderRadius: '12px',
                bgcolor: alreadyInCart ? '#3B82F6' : '#eef4ff',
                color: alreadyInCart ? '#fff' : '#1f5bd1',
                transition: 'background 0.15s, color 0.15s',
                '&:hover': { bgcolor: '#3B82F6', color: '#fff' },
                '&:active': { transform: 'scale(0.92)' },
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
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
      <Box sx={{ p: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Skeleton width="80%" height={20} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={22} height={22} />
          <Skeleton width="50%" height={16} />
        </Box>
        <Skeleton width="60%" height={14} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: '12px', borderTop: '1px solid #e5e8f0' }}>
          <Skeleton width={50} height={24} />
          <Skeleton variant="rounded" width={38} height={38} />
        </Box>
      </Box>
    </Card>
  )
}
