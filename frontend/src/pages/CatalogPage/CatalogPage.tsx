import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Divider from '@mui/material/Divider'
import Navbar from '../../widgets/Navbar/Navbar'
import Footer from '../../widgets/Footer/Footer'
import AssetCard from '../../entities/asset/ui/AssetCard'
import { useInfiniteAssets, useCategories } from '../../entities/asset/api/useAssets'
import type { AssetFilters, CategoryDto } from '../../entities/asset/types'

export default function CatalogPage() {
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState<Omit<AssetFilters, 'page' | 'size'>>({
    category: searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
    sort: (searchParams.get('sort') as AssetFilters['sort']) ?? 'newest',
  })

  const { data: categories } = useCategories()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteAssets({ ...filters, size: 20 })

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const allAssets = data?.pages.flatMap((p) => p.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ flex: 1, maxWidth: 1440, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '1.75rem', display: 'inline' }}>
            Каталог активів
          </Typography>
          {totalElements > 0 && (
            <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 2 }}>
              {totalElements.toLocaleString()} активів
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <Box sx={{ width: 224, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
            <CatalogSidebar categories={categories ?? []} filters={filters} onChange={setFilters} />
          </Box>

          {/* Grid */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <AssetCard key={i} isLoading />)
                : allAssets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
            </Box>

            {/* Infinite scroll trigger */}
            <Box ref={loaderRef} sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              {isFetchingNextPage && <CircularProgress size={28} />}
              {!isLoading && !hasNextPage && allAssets.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Всі {totalElements.toLocaleString()} активів завантажено
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}

/* ── CatalogSidebar ─────────────────────────────────────── */
interface SidebarProps {
  categories: CategoryDto[]
  filters: Omit<AssetFilters, 'page' | 'size'>
  onChange: (f: Omit<AssetFilters, 'page' | 'size'>) => void
}

function CatalogSidebar({ categories, filters, onChange }: SidebarProps) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Фільтри</Typography>

      {/* Sort */}
      <FormControl size="small" fullWidth sx={{ mb: 3 }}>
        <InputLabel>Сортування</InputLabel>
        <Select
          value={filters.sort ?? 'newest'}
          label="Сортування"
          onChange={(e) => onChange({ ...filters, sort: e.target.value as AssetFilters['sort'] })}
        >
          <MenuItem value="newest">Нові</MenuItem>
          <MenuItem value="trending">Популярні</MenuItem>
          <MenuItem value="price_asc">Ціна ↑</MenuItem>
          <MenuItem value="price_desc">Ціна ↓</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ mb: 2 }} />

      {/* Categories */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Категорія</Typography>
      <RadioGroup
        value={filters.category != null ? String(filters.category) : ''}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <FormControlLabel value="" control={<Radio size="small" />} label="Всі" />
        {categories.map((cat) => (
          <FormControlLabel
            key={cat.id}
            value={String(cat.id)}
            control={<Radio size="small" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <span>{cat.name}</span>
                <Typography variant="caption" color="text.secondary">({cat.assetCount})</Typography>
              </Box>
            }
          />
        ))}
      </RadioGroup>

      <Divider sx={{ mt: 2, mb: 2 }} />

      {/* License */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Ліцензія</Typography>
      <RadioGroup
        value={filters.license ?? ''}
        onChange={(e) =>
          onChange({ ...filters, license: (e.target.value as AssetFilters['license']) || undefined })
        }
      >
        <FormControlLabel value="" control={<Radio size="small" />} label="Будь-яка" />
        <FormControlLabel value="STANDARD" control={<Radio size="small" />} label="Стандартна" />
        <FormControlLabel value="COMMERCIAL" control={<Radio size="small" />} label="Комерційна" />
      </RadioGroup>
    </Box>
  )
}
