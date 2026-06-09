import { useNavigate } from 'react-router-dom'
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
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Navbar from '../../widgets/Navbar/Navbar'
import Footer from '../../widgets/Footer/Footer'
import { useCategories } from '../../entities/asset/api/useAssets'
import { useCreateAsset } from '../../features/author-assets/useAuthorAssets'

const schema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи').max(500),
  description: z.string().optional(),
  categoryId: z.coerce.number({ invalid_type_error: 'Оберіть категорію' }).positive('Оберіть категорію'),
  price: z.coerce.number({ invalid_type_error: 'Вкажіть ціну' }).min(0.01, 'Мінімальна ціна $0.01').max(9999.99),
  licenseType: z.enum(['STANDARD', 'COMMERCIAL']),
  tags: z.string().optional(),
  previewUrls: z.string().optional(),
  file: z.any().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AssetUploadPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()
  const { mutate: createAsset, isPending, error } = useCreateAsset()

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { licenseType: 'STANDARD' },
  })

  const selectedFile = watch('file')
  const fileName = selectedFile?.[0]?.name

  const onSubmit = (values: FormValues) => {
    createAsset(
      {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        price: values.price,
        licenseType: values.licenseType,
        tags: values.tags,
        previewUrls: values.previewUrls,
        file: values.file,
      },
      {
        onSuccess: () => navigate('/dashboard/assets'),
      },
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ flex: 1, maxWidth: 760, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 6 }}>
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

        <Typography variant="h2" sx={{ mb: 4 }}>Новий актив</Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          Після збереження актив отримає статус «На перевірці» та буде опублікований після схвалення модератором.
        </Alert>

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
            placeholder="Детальний опис активу, що входить до комплекту, технічні характеристики..."
          />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              select
              label="Категорія"
              defaultValue=""
              {...register('categoryId')}
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
            placeholder="3d, game-assets, sci-fi, lowpoly"
            helperText="Допоможуть покупцям знайти ваш актив"
          />

          <TextField
            label="URL прев'ю (кожне з нового рядка)"
            {...register('previewUrls')}
            multiline
            rows={3}
            fullWidth
            placeholder="https://example.com/preview1.jpg&#10;https://example.com/preview2.jpg"
            helperText="Зображення, які побачить покупець на сторінці активу"
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Файл активу</Typography>
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
                {fileName ?? 'Клікніть або перетягніть файл сюди'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ZIP, RAR, PDF, ZIP або будь-який інший формат
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
              {isPending ? 'Збереження...' : 'Відправити на перевірку'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
