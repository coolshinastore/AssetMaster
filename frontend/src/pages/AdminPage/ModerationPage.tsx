import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { usePendingAssets, useApproveAsset, useRejectAsset } from '../../features/admin-panel/useAdmin'
import type { AdminAssetDto } from '../../entities/asset/types'

export default function ModerationPage() {
  const [page, setPage] = useState(0)
  const [rejectTarget, setRejectTarget] = useState<AdminAssetDto | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = usePendingAssets(page)
  const approve = useApproveAsset()
  const reject = useRejectAsset()

  const handleRejectOpen = (asset: AdminAssetDto) => {
    setRejectTarget(asset)
    setRejectReason('')
  }

  const handleRejectConfirm = () => {
    if (!rejectTarget) return
    reject.mutate(
      { id: rejectTarget.id, reason: rejectReason },
      { onSuccess: () => setRejectTarget(null) },
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Модерація активів
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ fontWeight: 600 }}>Актив</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Автор</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Категорія</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ціна</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Подано</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      Активів на модерації немає
                    </TableCell>
                  </TableRow>
                )
                : data?.content.map(asset => (
                  <TableRow key={asset.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={asset.previewUrls[0]}
                          variant="rounded"
                          sx={{ width: 44, height: 44, bgcolor: 'background.default' }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 200 }} noWrap>
                            {asset.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{asset.id}
                          </Typography>
                        </Box>
                        <Tooltip title="Відкрити сторінку">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/assets/${asset.id}`}
                            target="_blank"
                          >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{asset.authorName ?? asset.authorEmail}</Typography>
                      <Typography variant="caption" color="text.secondary">{asset.authorEmail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={asset.categoryName ?? '—'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${asset.price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(asset.createdAt).toLocaleDateString('uk-UA')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Схвалити">
                          <IconButton
                            color="success"
                            onClick={() => approve.mutate(asset.id)}
                            disabled={approve.isPending}
                          >
                            <CheckCircleOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Відхилити">
                          <IconButton
                            color="error"
                            onClick={() => handleRejectOpen(asset)}
                            disabled={reject.isPending}
                          >
                            <CancelOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.totalElements ?? 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} з ${count}`}
        />
      </Paper>

      {/* Reject dialog */}
      <Dialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Відхилити актив
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            «{rejectTarget?.title}» — вкажіть причину відхилення для автора
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Причина відхилення"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Наприклад: низька якість прев'ю, відсутній опис..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRejectTarget(null)} color="inherit">
            Скасувати
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={reject.isPending}
          >
            Відхилити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
