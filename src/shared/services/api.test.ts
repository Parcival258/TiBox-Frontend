import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildUrl, getJson, postJson } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('normalizes endpoint URLs', () => {
    expect(buildUrl('/api/v1/equipment')).toBe('http://localhost:3333/api/v1/equipment')
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
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 422 })
    vi.stubGlobal('fetch', fetchMock)

    await expect(postJson('/api/v1/equipment', { serial: 'ABC' })).rejects.toThrow('HTTP 422')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3333/api/v1/equipment',
      expect.objectContaining({ body: JSON.stringify({ serial: 'ABC' }), method: 'POST' })
    )
  })
})
