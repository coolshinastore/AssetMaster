import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Chip from '@mui/material/Chip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { useAssetDetail, useCategories } from '../../entities/asset/api/useAssets'
import { useUpdateAsset } from '../../features/author-assets/useAuthorAssets'
import { useAuth } from '../../features/auth/AuthContext'

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  DRAFT:     { label: 'Чернетка',     color: 'default' },
  PENDING:   { label: 'На перевірці', color: 'warning' },
  PUBLISHED: { label: 'Опубліковано', color: 'success' },
  REJECTED:  { label: 'Відхилено',    color: 'error' },
}

const schema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи').max(500),
  description: z.string().optional(),
  categoryId: z.coerce.number({ invalid_type_error: 'Оберіть категорію' }).positive('Оберіть категорію'),
  price: z.coerce.number({ invalid_type_error: 'Вкажіть ціну' }).min(0.01).max(9999.99),
  licenseType: z.enum(['STANDARD', 'COMMERCIAL']),
  tags: z.string().optional(),
  previewUrls: z.string().optional(),
  file: z.any().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AssetEditPage() {
  const { id } = useParams<{ id: string }>()
  const assetId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: asset, isLoading: loadingAsset } = useAssetDetail(assetId)
  const { data: categories = [] } = useCategories()
  const { mutate: updateAsset, isPending, error } = useUpdateAsset()

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!asset) return
    reset({
      title: asset.title,
      description: asset.description ?? '',
      categoryId: asset.categoryId ?? undefined,
      price: asset.price,
      licenseType: asset.licenseType,
      tags: asset.tags?.join(', ') ?? '',
      previewUrls: asset.previewUrls.join('\n'),
    })
  }, [asset, reset])

  // Ownership check
  const isOwner = asset?.authorId === user?.id

  const selectedFile = watch('file')
  const fileName = selectedFile?.[0]?.name

  const onSubmit = (values: FormValues) => {
    updateAsset(
      {
        id: assetId,
        data: {
          title: values.title,
          description: values.description,
          categoryId: values.categoryId,
          price: values.price,
          licenseType: values.licenseType,
          tags: values.tags,
          previewUrls: values.previewUrls,
          file: values.file,
        },
      },
      { onSuccess: () => navigate('/dashboard/assets') },
    )
  }

  if (loadingAsset) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Skeleton variant="text" width={200} height={48} sx={{ mb: 4 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    )
  }

  if (!asset || !isOwner) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, py: 12 }}>
        <Typography variant="h5">Актив не знайдено або немає доступу</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard/assets')}>
          До моїх активів
        </Button>
      </Box>
    )
  }

  const statusInfo = STATUS_LABELS[asset.status] ?? { label: asset.status, color: 'default' as const }

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Button
            onClick={() => navigate('/dashboard/assets')}
            startIcon={<ArrowBackIcon />}
            variant="text"
            sx={{ color: 'text.secondary' }}
          >
            Назад
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Typography variant="h2">Редагувати актив</Typography>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
          />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label="Назва активу"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
            fullWidth
            required
          />

          <TextField
            label="Опис"
            {...register('description')}
            multiline
            rows={4}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Категорія"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value) || '')}
                  onBlur={field.onBlur}
                  name={field.name}
                  inputRef={field.ref}
                  error={!!errors.categoryId}
                  helperText={errors.categoryId?.message}
                  sx={{ flex: 1 }}
                  required
                >
                  <MenuItem value="" disabled>Оберіть категорію</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField
              label="Ціна (USD)"
              type="number"
              inputProps={{ min: 0.01, max: 9999.99, step: 0.01 }}
              {...register('price')}
              error={!!errors.price}
              helperText={errors.price?.message}
              sx={{ flex: 1 }}
              required
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Тип ліцензії</Typography>
            <Controller
              name="licenseType"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  value={field.value}
                  exclusive
                  onChange={(_, val) => { if (val) field.onChange(val) }}
                  size="small"
                >
                  <ToggleButton value="STANDARD" sx={{ px: 3 }}>Стандартна</ToggleButton>
                  <ToggleButton value="COMMERCIAL" sx={{ px: 3 }}>Комерційна</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          </Box>

          <TextField
            label="Теги (через кому)"
            {...register('tags')}
            fullWidth
            placeholder="3d, game-assets, sci-fi"
          />

          <TextField
            label="URL прев'ю (кожне з нового рядка)"
            {...register('previewUrls')}
            multiline
            rows={3}
            fullWidth
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Замінити файл активу (необов'язково)
            </Typography>
            <Box
              sx={{
                border: '2px dashed #e5e8f0',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                bgcolor: '#f8f9fc',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: '#eef4ff' },
                transition: 'all 0.2s',
              }}
              component="label"
            >
              <input type="file" style={{ display: 'none' }} {...register('file')} />
              <UploadFileIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fileName ?? 'Клікніть щоб вибрати новий файл'}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error">Помилка при збереженні. Перевірте дані та спробуйте ще раз.</Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/dashboard/assets')} disabled={isPending}>
              Скасувати
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isPending ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </Box>
        </Box>
    </Box>
  )
}
