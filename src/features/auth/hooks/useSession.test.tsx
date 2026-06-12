import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, login, logout } from '../services/authService'
import { useSession } from './useSession'

vi.mock('../services/authService', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

const user = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Usuario',
  permissions: [],
  role: null,
}

describe('useSession', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
    vi.mocked(login).mockReset()
    vi.mocked(logout).mockReset()
  })

  it('restores an authenticated session', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ user })
    const { result } = renderHook(() => useSession())

    await waitFor(() => expect(result.current.status).toBe('authenticated'))
    expect(result.current.user).toEqual(user)
  })

  it('reports invalid credentials and returns to guest state', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('unauthorized'))
    vi.mocked(login).mockRejectedValue(new Error('unauthorized'))
    const { result } = renderHook(() => useSession())

    await waitFor(() => expect(result.current.status).toBe('guest'))
    await act(() => result.current.signIn('user@example.com', 'bad-password'))

    expect(result.current.loginError).toBe('Credenciales invalidas o backend no disponible.')
    expect(result.current.status).toBe('guest')
  })
})
