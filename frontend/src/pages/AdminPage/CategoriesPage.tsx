import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../features/admin-panel/useAdmin'
import type { CategoryDto, UpsertCategoryRequest } from '../../features/admin-panel/adminApi'

const EMPTY_FORM: UpsertCategoryRequest = { name: '', slug: '', parentId: null, iconUrl: null }

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function CategoryDialog({
  open,
  editing,
  categories,
  onClose,
}: {
  open: boolean
  editing: CategoryDto | null
  categories: CategoryDto[]
  onClose: () => void
}) {
  const [form, setForm] = useState<UpsertCategoryRequest>(
    editing ? { name: editing.name, slug: editing.slug, parentId: editing.parentId, iconUrl: editing.iconUrl } : EMPTY_FORM
  )
  const [error, setError] = useState('')

  const create = useCreateCategory()
  const update = useUpdateCategory()

  const isPending = create.isPending || update.isPending

  function set<K extends keyof UpsertCategoryRequest>(key: K, value: UpsertCategoryRequest[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.slug.trim()) { setError('Назва та slug обов\'язкові'); return }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, req: form })
      } else {
        await create.mutateAsync(form)
      }
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Помилка збереження')
    }
  }

  const parents = categories.filter(c => !editing || c.id !== editing.id)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Редагувати категорію' : 'Нова категорія'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        <TextField
          label="Назва"
          value={form.name}
          onChange={e => {
            set('name', e.target.value)
            if (!editing) set('slug', slugify(e.target.value))
          }}
          fullWidth
          required
        />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={e => set('slug', slugify(e.target.value))}
          fullWidth
          required
          helperText="Використовується в URL: /catalog/slug"
        />
        <TextField
          select
          label="Батьківська категорія"
          value={form.parentId ?? ''}
          onChange={e => set('parentId', e.target.value === '' ? null : Number(e.target.value))}
          fullWidth
        >
          <MenuItem value="">— Немає (коренева) —</MenuItem>
          {parents.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="URL іконки (необов'язково)"
          value={form.iconUrl ?? ''}
          onChange={e => set('iconUrl', e.target.value || null)}
          fullWidth
          placeholder="https://..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>Скасувати</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
          {editing ? 'Зберегти' : 'Створити'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories()
  const deleteCategory = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryDto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<CategoryDto | null>(null)

  function openCreate() { setEditing(null); setDialogOpen(true) }
  function openEdit(c: CategoryDto) { setEditing(c); setDialogOpen(true) }
  function closeDialog() { setDialogOpen(false); setEditing(null) }

  function parentName(parentId: number | null) {
    if (!parentId || !categories) return '—'
    return categories.find(c => c.id === parentId)?.name ?? '—'
  }

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h2">Категорії</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Нова категорія
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>ID</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Батьківська</TableCell>
              <TableCell align="right">Активів</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 7 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}><Skeleton /></TableCell>
                ))}
              </TableRow>
            ))}
            {!isLoading && categories?.map(c => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>{c.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                <TableCell>
                  <Chip label={c.slug} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{parentName(c.parentId)}</TableCell>
                <TableCell align="right">{c.assetCount}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Редагувати">
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" color="error" onClick={() => setConfirmDelete(c)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {dialogOpen && (
        <CategoryDialog
          open={dialogOpen}
          editing={editing}
          categories={categories ?? []}
          onClose={closeDialog}
        />
      )}

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle>Видалити категорію?</DialogTitle>
        <DialogContent>
          <Typography>
            Категорія <strong>«{confirmDelete?.name}»</strong> буде видалена. Активи в цій категорії залишаться без категорії.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)}>Скасувати</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteCategory.isPending}
            onClick={async () => {
              if (confirmDelete) {
                await deleteCategory.mutateAsync(confirmDelete.id)
                setConfirmDelete(null)
              }
            }}
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
