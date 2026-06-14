import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Navbar from '../../widgets/Navbar/Navbar'
import Footer from '../../widgets/Footer/Footer'
import { useAssetDetail } from '../../entities/asset/api/useAssets'
import { useCart } from '../../features/cart/CartContext'
import { useAuth } from '../../features/auth/AuthContext'
import { useReviews, useCreateReview } from '../../features/reviews/useReviews'

export default function AssetPage() {
  const { id } = useParams<{ id: string }>()
  const { data: asset, isLoading, isError } = useAssetDetail(Number(id))
  const [tab,     setTab]     = useState(0)
  const [imgIdx,  setImgIdx]  = useState(0)
  const [license, setLicense] = useState<'STANDARD' | 'COMMERCIAL'>('STANDARD')
  const { addItem, isInCart } = useCart()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [reviewPage, setReviewPage] = useState(0)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const { data: reviews } = useReviews(Number(id), reviewPage)
  const createReview = useCreateReview(Number(id))

  const handleAddToCart = () => {
    if (!asset) return
    addItem({
      id: asset.id,
      title: asset.title,
      thumbnailUrl: asset.previewUrls?.[0] ?? null,
      authorName: asset.authorName ?? '',
      price: asset.price,
      licenseType: license,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/checkout')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ flex: 1, maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        {isLoading && <AssetPageSkeleton />}

        {isError && (
          <Typography color="error" sx={{ mt: 4 }}>Актив не знайдено або сталася помилка.</Typography>
        )}

        {asset && (
          <Box sx={{ display: 'flex', gap: { md: 6 }, flexDirection: { xs: 'column', md: 'row' } }}>

            {/* ── Left column (60%) ──────────────────────────── */}
            <Box sx={{ flex: '0 0 60%', minWidth: 0 }}>

              {/* Image slider */}
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #e5e8f0',
                  bgcolor: '#f1f3f9',
                  aspectRatio: '16/10',
                }}
              >
                {asset.previewUrls.length > 0 ? (
                  <Box
                    component="img"
                    src={asset.previewUrls[imgIdx]}
                    alt={asset.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Зображення відсутнє</Typography>
                  </Box>
                )}

                {asset.previewUrls.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => setImgIdx((p) => Math.max(0, p - 1))}
                      disabled={imgIdx === 0}
                      size="small"
                      sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.9)' }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setImgIdx((p) => Math.min(asset.previewUrls.length - 1, p + 1))}
                      disabled={imgIdx === asset.previewUrls.length - 1}
                      size="small"
                      sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.9)' }}
                    >
                      <ChevronRightIcon />
                    </IconButton>

                    {/* Dot indicators */}
                    <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.75 }}>
                      {asset.previewUrls.map((_, i) => (
                        <Box
                          key={i}
                          onClick={() => setImgIdx(i)}
                          sx={{
                            width: i === imgIdx ? 20 : 8, height: 8,
                            borderRadius: 4,
                            bgcolor: i === imgIdx ? 'primary.main' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>

              {/* Thumbnail strip */}
              {asset.previewUrls.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto' }}>
                  {asset.previewUrls.map((url, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={url}
                      onClick={() => setImgIdx(i)}
                      sx={{
                        width: 72, height: 45,
                        objectFit: 'cover',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: i === imgIdx ? 'primary.main' : 'transparent',
                        flexShrink: 0,
                        opacity: i === imgIdx ? 1 : 0.65,
                        transition: 'all 0.15s',
                        '&:hover': { opacity: 1 },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ mt: 4, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Опис" />
                <Tab label="Характеристики" />
                <Tab label={`Відгуки (${reviews?.totalElements ?? 0})`} />
              </Tabs>

              {tab === 0 && (
                <Box sx={{ py: 3 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {asset.description || 'Опис відсутній.'}
                  </Typography>
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ py: 3 }}>
                  <Stack spacing={2} divider={<Box sx={{ borderBottom: '1px solid #e5e8f0' }} />}>
                    {[
                      ['Категорія',    asset.categoryName ?? '—'],
                      ['Ліцензія',     asset.licenseType === 'STANDARD' ? 'Стандартна' : 'Комерційна'],
                      ['Завантажень',  asset.downloadsCount.toLocaleString()],
                      ['Переглядів',   asset.viewsCount.toLocaleString()],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">{label}</Typography>
                        <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
                      </Box>
                    ))}
                    {asset.tags && asset.tags.length > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography color="text.secondary">Теги</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: '60%', justifyContent: 'flex-end' }}>
                          {asset.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}

              {tab === 2 && (
                <Box sx={{ py: 3 }}>
                  {/* Write review form */}
                  {isAuthenticated ? (
                    <Box sx={{ mb: 4, p: 3, border: '1px solid #e5e8f0', borderRadius: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                        Залишити відгук
                      </Typography>
                      {/* Star picker */}
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <IconButton key={star} size="small" onClick={() => setReviewRating(star)}>
                            {star <= reviewRating
                              ? <StarIcon sx={{ color: 'warning.main' }} />
                              : <StarBorderIcon sx={{ color: 'warning.main' }} />}
                          </IconButton>
                        ))}
                      </Box>
                      <TextField
                        fullWidth multiline rows={3}
                        placeholder="Ваш відгук (необов'язково)..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      {reviewError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>
                      )}
                      <Button
                        variant="contained"
                        disabled={reviewRating === 0 || createReview.isPending}
                        onClick={() => {
                          setReviewError(null)
                          createReview.mutate(
                            { rating: reviewRating, comment: reviewComment },
                            {
                              onSuccess: () => { setReviewRating(0); setReviewComment('') },
                              onError: (err: unknown) => {
                                const msg = (err as { response?: { data?: { detail?: string } } })
                                  ?.response?.data?.detail
                                setReviewError(msg ?? 'Не вдалося залишити відгук')
                              },
                            },
                          )
                        }}
                      >
                        Опублікувати відгук
                      </Button>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Увійдіть та придбайте актив, щоб залишити відгук
                    </Alert>
                  )}

                  {/* Reviews list */}
                  {reviews?.content.length === 0 && (
                    <Typography color="text.secondary">Відгуків ще немає. Будьте першим!</Typography>
                  )}
                  <Stack spacing={3} divider={<Divider />}>
                    {reviews?.content.map(review => (
                      <Box key={review.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Avatar src={review.authorAvatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                            {review.authorName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {review.authorName ?? 'Користувач'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                            </Typography>
                          </Box>
                          <Box sx={{ ml: 'auto', display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <StarIcon
                                key={s}
                                sx={{ fontSize: 16, color: s <= review.rating ? 'warning.main' : '#e5e8f0' }}
                              />
                            ))}
                          </Box>
                        </Box>
                        {review.comment && (
                          <Typography variant="body2" sx={{ ml: 6, color: 'text.secondary' }}>
                            {review.comment}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>

                  {reviews && reviews.totalPages > 1 && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'center' }}>
                      <Button
                        size="small" disabled={reviewPage === 0}
                        onClick={() => setReviewPage(p => p - 1)}
                      >
                        Попередня
                      </Button>
                      <Button
                        size="small" disabled={reviews.last}
                        onClick={() => setReviewPage(p => p + 1)}
                      >
                        Наступна
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* ── Right column (40%), sticky ─────────────────── */}
            <Box sx={{ flex: 1, position: { md: 'sticky' }, top: { md: 80 }, alignSelf: { md: 'flex-start' } }}>
              {asset.categoryName && (
                <Chip
                  label={asset.categoryName}
                  size="small"
                  component={Link}
                  to={`/catalog?category=${asset.categoryId}`}
                  clickable
                  sx={{ mb: 2 }}
                />
              )}

              <Typography variant="h1" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 2 }}>
                {asset.title}
              </Typography>

              {/* Author */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar src={asset.authorAvatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                  {asset.authorName?.[0]}
                </Avatar>
                <Typography
                  component={Link}
                  to={`/authors/${asset.authorId}`}
                  variant="body2"
                  sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
                >
                  {asset.authorName}
                </Typography>
              </Box>

              {/* Price */}
              <Typography
                sx={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: 'primary.main',
                  letterSpacing: '-0.03em',
                  mb: 3,
                }}
              >
                ${asset.price}
              </Typography>

              {/* License toggle */}
              <ToggleButtonGroup
                value={license}
                exclusive
                onChange={(_, v) => v && setLicense(v)}
                size="small"
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="STANDARD" sx={{ flex: 1 }}>Стандартна</ToggleButton>
                <ToggleButton value="COMMERCIAL" sx={{ flex: 1 }}>Комерційна</ToggleButton>
              </ToggleButtonGroup>

              {/* CTAs */}
              <Stack spacing={1.5} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={isInCart(asset.id)}
                >
                  {isInCart(asset.id) ? 'Вже в кошику' : 'Додати до кошика'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleBuyNow}
                >
                  Купити зараз
                </Button>
              </Stack>

              {/* Trust bar */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  pt: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>4.9</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {asset.downloadsCount.toLocaleString()} продажів
                </Typography>
                {asset.authorVerified && (
                  <Chip label="Verified Author" size="small" color="success" sx={{ fontSize: '0.7rem', height: 22 }} />
                )}
              </Box>
            </Box>

          </Box>
        )}
      </Box>

      <Footer />
    </Box>
  )
}

function AssetPageSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ flex: '0 0 60%' }}>
        <Skeleton variant="rectangular" width="100%" sx={{ aspectRatio: '16/10', borderRadius: 3 }} />
        <Box sx={{ mt: 4 }}>
          <Skeleton width="30%" height={28} />
          <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Skeleton width={80} height={24} sx={{ mb: 1 }} />
        <Skeleton width="70%" height={30} sx={{ mb: 2 }} />
        <Skeleton width={60} height={20} sx={{ mb: 3 }} />
        <Skeleton width={80} height={48} sx={{ mb: 3 }} />
        <Skeleton width="100%" height={52} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={52} />
      </Box>
    </Box>
  )
}
