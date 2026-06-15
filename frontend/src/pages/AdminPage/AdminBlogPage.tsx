import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  useAdminBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
} from '../../features/admin-panel/useAdmin'
import type { AdminBlogPostDto, CreateBlogPostRequest } from '../../features/admin-panel/adminApi'

const EMPTY_FORM: CreateBlogPostRequest = {
  slug: '', tag: '', title: '', excerpt: '', content: '', published: false, readTime: '',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface BlogFormDialogProps {
  open: boolean
  initial: CreateBlogPostRequest
  onClose: () => void
  onSave: (data: CreateBlogPostRequest) => void
  isPending: boolean
  title: string
}

function BlogFormDialog({ open, initial, onClose, onSave, isPending, title }: BlogFormDialogProps) {
  const [form, setForm] = useState<CreateBlogPostRequest>(initial)

  function set<K extends keyof CreateBlogPostRequest>(k: K, v: CreateBlogPostRequest[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleOpen() {
    setForm(initial)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionProps={{ onEnter: handleOpen }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Заголовок" value={form.title} required fullWidth
            onChange={e => set('title', e.target.value)}
          />
          <TextField
            label="Slug" value={form.slug} required sx={{ minWidth: 200 }}
            onChange={e => set('slug', e.target.value)}
            helperText="Унікальний ідентифікатор у URL"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Тег (категорія)" value={form.tag} fullWidth
            onChange={e => set('tag', e.target.value)}
          />
          <TextField
            label="Час читання" value={form.readTime} sx={{ minWidth: 160 }}
            onChange={e => set('readTime', e.target.value)}
            placeholder="8 хв"
          />
        </Box>
        <TextField
          label="Короткий опис (excerpt)" value={form.excerpt} fullWidth multiline rows={2}
          onChange={e => set('excerpt', e.target.value)}
        />
        <TextField
          label="Контент (Markdown)" value={form.content} fullWidth required multiline rows={14}
          onChange={e => set('content', e.target.value)}
          inputProps={{ style: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' } }}
        />
        <FormControlLabel
          control={<Switch checked={form.published} onChange={e => set('published', e.target.checked)} color="primary" />}
          label="Опублікувати (стаття одразу стане видимою)"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>Скасувати</Button>
        <Button
          variant="contained"
          disabled={isPending || !form.title.trim() || !form.slug.trim() || !form.content.trim()}
          onClick={() => onSave(form)}
        >
          {isPending ? <CircularProgress size={20} /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AdminBlogPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useAdminBlogPosts(page)

  const createMutation = useCreateBlogPost()
  const updateMutation = useUpdateBlogPost()
  const deleteMutation = useDeleteBlogPost()

  const [createOpen, setCreateOpen] = useState(false)
  const [editPost, setEditPost] = useState<AdminBlogPostDto | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  function handleCreate(form: CreateBlogPostRequest) {
    createMutation.mutate(form, { onSuccess: () => setCreateOpen(false) })
  }

  function handleUpdate(form: CreateBlogPostRequest) {
    if (!editPost) return
    updateMutation.mutate({ id: editPost.id, req: form }, { onSuccess: () => setEditPost(null) })
  }

  function handleDelete() {
    if (deleteId == null) return
    deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (isError) return <Alert severity="error" sx={{ m: 3 }}>Помилка завантаження статей</Alert>

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Блог</Typography>
          <Typography variant="body2" color="text.secondary">{data?.totalElements ?? 0} статей</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Нова стаття
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700 }}>Заголовок</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Тег</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Читання</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.content.map(post => (
              <TableRow key={post.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 320 }} noWrap>
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">/blog/{post.slug}</Typography>
                </TableCell>
                <TableCell>
                  {post.tag && <Chip label={post.tag} size="small" variant="outlined" />}
                </TableCell>
                <TableCell>
                  <Chip
                    label={post.published ? 'Опублікована' : 'Чернетка'}
                    color={post.published ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{post.readTime ?? '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{formatDate(post.createdAt)}</Typography>
                </TableCell>
                <TableCell align="right">
                  {post.published && (
                    <Tooltip title="Переглянути на сайті">
                      <IconButton size="small" component={Link} to={`/blog/${post.slug}`} target="_blank">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Редагувати">
                    <IconButton size="small" onClick={() => setEditPost(post)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(post.id)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {data?.content.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                  Статей ще немає. Створіть першу!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.totalElements ?? 0}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} з ${count}`}
        />
      </TableContainer>

      {/* Create dialog */}
      <BlogFormDialog
        open={createOpen}
        initial={EMPTY_FORM}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        isPending={createMutation.isPending}
        title="Нова стаття"
      />

      {/* Edit dialog */}
      <BlogFormDialog
        open={!!editPost}
        initial={editPost ? {
          slug: editPost.slug,
          tag: editPost.tag ?? '',
          title: editPost.title,
          excerpt: editPost.excerpt ?? '',
          content: editPost.content,
          published: editPost.published,
          readTime: editPost.readTime ?? '',
        } : EMPTY_FORM}
        onClose={() => setEditPost(null)}
        onSave={handleUpdate}
        isPending={updateMutation.isPending}
        title="Редагувати статтю"
      />

      {/* Delete confirm */}
      <Dialog open={deleteId != null} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Видалити статтю?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Цю дію не можна скасувати.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Скасувати</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
