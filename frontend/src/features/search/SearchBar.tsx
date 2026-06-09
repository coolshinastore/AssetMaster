import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import useDebounce from '../../shared/hooks/useDebounce'
import { searchAssets } from '../../entities/asset/api/assetApi'
import type { AssetSummaryDto } from '../../entities/asset/types'

interface Props {
  large?: boolean
}

export default function SearchBar({ large }: Props) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const debouncedInput = useDebounce(input, 300)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['autocomplete', debouncedInput],
    queryFn: () => searchAssets(debouncedInput, 0, 6),
    enabled: debouncedInput.length >= 2,
    placeholderData: (prev) => prev,
  })

  const suggestions: AssetSummaryDto[] = data?.content ?? []

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      setOpen(false)
      navigate(`/search?q=${encodeURIComponent(input.trim())}`)
    }
  }

  const handleSelect = (asset: AssetSummaryDto) => {
    setOpen(false)
    setInput('')
    navigate(`/assets/${asset.id}`)
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        value={input}
        onChange={(e) => { setInput(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Пошук активів, авторів..."
        fullWidth
        size={large ? 'medium' : 'small'}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: large ? 'white' : '#f1f3f9',
            borderRadius: 3,
          },
        }}
      />

      {open && suggestions.length > 0 && debouncedInput.length >= 2 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 1300,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((asset) => (
            <Box
              key={asset.id}
              onMouseDown={() => handleSelect(asset)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: '1px solid #f1f3f9',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: '#f1f3f9' },
              }}
            >
              {asset.thumbnailUrl && (
                <Box
                  component="img"
                  src={asset.thumbnailUrl}
                  alt=""
                  sx={{ width: 48, height: 30, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{asset.title}</Typography>
                <Typography variant="caption" color="text.secondary">{asset.authorName}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, flexShrink: 0 }}>
                ${asset.price}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  )
}
