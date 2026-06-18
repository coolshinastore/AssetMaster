import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AssetCard from '../../entities/asset/ui/AssetCard'
import type { AssetSummaryDto } from '../../entities/asset/types'

interface Props {
  label: string
  assets?: AssetSummaryDto[]
  isLoading?: boolean
  viewAllHref?: string
  skeletonCount?: number
}

export default function AssetGrid({ label, assets, isLoading, viewAllHref, skeletonCount = 8 }: Props) {
  return (
    <Box>
      {label && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h2">{label}</Typography>
          {viewAllHref && (
            <Button component={Link} to={viewAllHref} size="small">
              Дивитись всі →
            </Button>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => <AssetCard key={i} isLoading />)
          : (assets ?? []).map((asset) => <AssetCard key={asset.id} asset={asset} />)}
      </Box>
    </Box>
  )
}
