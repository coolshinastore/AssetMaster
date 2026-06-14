import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../pages/auth/LoginPage'

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ requires2fa: false }),
    verify2fa: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
    user: null,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    wrap()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    wrap()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /увійти/i }))

    await waitFor(() => {
      expect(screen.getByText('Невірний формат email')).toBeInTheDocument()
      expect(screen.getByText('Мінімум 8 символів')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    wrap()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /увійти/i }))

    await waitFor(() => {
      expect(screen.getByText('Невірний формат email')).toBeInTheDocument()
    })
  })
})
