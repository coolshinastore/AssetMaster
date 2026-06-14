import { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { useMyAssets, useDeleteAsset } from '../../features/author-assets/useAuthorAssets'
import type { AuthorAssetDto } from '../../entities/asset/types'

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'error' | 'info' }> = {
  DRAFT:     { label: 'Чернетка',   color: 'default' },
  PENDING:   { label: 'На перевірці', color: 'warning' },
  PUBLISHED: { label: 'Опубліковано', color: 'success' },
  REJECTED:  { label: 'Відхилено',  color: 'error' },
}

export default function AssetsPage() {
  const { data: assets, isLoading } = useMyAssets()
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset()
  const [toDelete, setToDelete] = useState<AuthorAssetDto | null>(null)

  const handleDeleteConfirm = () => {
    if (!toDelete) return
    deleteAsset(toDelete.id, { onSuccess: () => setToDelete(null) })
  }

  return (
    <>
      <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h2">Мої активи</Typography>
          <Button
            component={Link}
            to="/dashboard/assets/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Додати актив
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        )}

        {!isLoading && (!assets || assets.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1 }}>Ще немає активів</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Завантажте свій перший цифровий актив
            </Typography>
            <Button component={Link} to="/dashboard/assets/new" variant="contained" startIcon={<AddIcon />}>
              Завантажити актив
            </Button>
          </Box>
        )}

        {assets && assets.length > 0 && (
          <Box sx={{ border: '1px solid #e5e8f0', borderRadius: 3, overflow: 'hidden', bgcolor: 'white' }}>
            {/* Table header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr 120px 100px 130px 96px',
                gap: 2,
                px: 2,
                py: 1.5,
                bgcolor: '#f8f9fc',
                borderBottom: '1px solid #e5e8f0',
              }}
            >
              {['', 'Назва', 'Категорія', 'Ціна', 'Статус', ''].map((h, i) => (
                <Typography key={i} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {/* Rows */}
            {assets.map((asset) => {
              const statusInfo = STATUS_LABELS[asset.status] ?? { label: asset.status, color: 'default' as const }
              return (
                <Box
                  key={asset.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr 120px 100px 130px 96px',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f3f9',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: '#f8f9fc' },
                  }}
                >
                  <Avatar
                    src={asset.thumbnailUrl ?? undefined}
                    variant="rounded"
                    sx={{ width: 56, height: 36, borderRadius: 1.5, flexShrink: 0 }}
                  >
                    {asset.title[0]}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      component={Link}
                      to={`/assets/${asset.id}`}
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', display: 'block', '&:hover': { color: 'primary.main' } }}
                    >
                      {asset.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {asset.tags?.join(', ') || '—'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {asset.categoryName ?? '—'}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${Number(asset.price).toFixed(2)}
                  </Typography>

                  <Chip
                    label={statusInfo.label}
                    color={statusInfo.color}
                    size="small"
                    sx={{ width: 'fit-content' }}
                  />

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Редагувати">
                      <IconButton
                        component={Link}
                        to={`/dashboard/assets/${asset.id}/edit`}
                        size="small"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Видалити">
                      <IconButton size="small" color="error" onClick={() => setToDelete(asset)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Видалити актив?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви дійсно хочете видалити «{toDelete?.title}»? Цю дію неможливо скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Скасувати</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
            {isDeleting ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
