import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildUrl, getJson, postJson, refreshCsrfToken, resolveServiceUrl } from './api'

afterEach(() => {
  document.cookie = 'XSRF-TOKEN=; Max-Age=0; Path=/'
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('normalizes endpoint URLs', () => {
    expect(buildUrl('/api/v1/equipment')).toBe('http://localhost:3333/api/v1/equipment')
  })

  it('derives the backend URL when running from a Dev Tunnel frontend', () => {
    expect(
      resolveServiceUrl(
        'http://localhost:3333',
        'https://j31b29t0-5173.use2.devtunnels.ms/login'
      )
    ).toBe('https://j31b29t0-3333.use2.devtunnels.ms')
  })

  it('sends credentials and parses JSON responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getJson<{ id: string }>('/api/v1/equipment/1')).resolves.toEqual({ id: '1' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3333/api/v1/equipment/1',
      expect.objectContaining({ credentials: 'include' })
    )
  })

  it('serializes JSON bodies and rejects failed requests', async () => {
    document.cookie = 'XSRF-TOKEN=encrypted-token; Path=/'
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 422 })
    vi.stubGlobal('fetch', fetchMock)

    await expect(postJson('/api/v1/equipment', { serial: 'ABC' })).rejects.toThrow('HTTP 422')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3333/api/v1/equipment',
      expect.objectContaining({
        body: JSON.stringify({ serial: 'ABC' }),
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'encrypted-token' }),
        method: 'POST',
      })
    )
  })

  it('bootstraps CSRF protection for cross-origin deployments', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'plain-csrf-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      })
    vi.stubGlobal('fetch', fetchMock)

    await refreshCsrfToken()
    await postJson('/api/v1/equipment', { serial: 'ABC' })

    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3333/api/v1/equipment',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-CSRF-TOKEN': 'plain-csrf-token' }),
      })
    )
  })
})
