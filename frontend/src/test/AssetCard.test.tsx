import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import AssetCard from '../entities/asset/ui/AssetCard'
import type { AssetSummaryDto } from '../entities/asset/types'

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}))
vi.mock('../features/wishlist/useWishlist', () => ({
  useToggleWishlist: () => ({ toggle: vi.fn(), isInWishlist: () => false }),
}))

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

const asset: AssetSummaryDto = {
  id: 1,
  title: 'UI Kit Pro',
  thumbnailUrl: null,
  authorId: 42,
  authorName: 'Jane Doe',
  authorAvatarUrl: null,
  authorVerified: false,
  categoryId: 2,
  categoryName: 'UI Kit',
  price: 29.99,
  licenseType: 'STANDARD',
  downloadsCount: 150,
  createdAt: '2024-01-15T10:00:00Z',
}

describe('AssetCard', () => {
  it('renders skeleton when isLoading=true', () => {
    const { container } = wrap(<AssetCard isLoading />)
    // Skeleton renders MUI spans, no asset title visible
    expect(screen.queryByText('UI Kit Pro')).toBeNull()
    expect(container.firstChild).toBeTruthy()
  })

  it('renders asset title and price', () => {
    wrap(<AssetCard asset={asset} />)
    expect(screen.getByText('UI Kit Pro')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('renders category chip', () => {
    wrap(<AssetCard asset={asset} />)
    expect(screen.getByText('UI Kit')).toBeInTheDocument()
  })

  it('renders author name', () => {
    wrap(<AssetCard asset={asset} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('links to the asset detail page', () => {
    wrap(<AssetCard asset={asset} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/assets/1')
  })
})
