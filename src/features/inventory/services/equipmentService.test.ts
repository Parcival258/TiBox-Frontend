import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEquipment } from './equipmentService'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('equipmentService', () => {
  it('maps inventory filters to the existing API query contract', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], meta: {} }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await getEquipment({ orderBy: 'createdAt', orderDirection: 'desc', page: 2, search: 'PC 01' })

    const requestedUrl = fetchMock.mock.calls[0][0] as string
    expect(requestedUrl).toContain('/api/v1/equipment?')
    expect(requestedUrl).toContain('page=2')
    expect(requestedUrl).toContain('search=PC+01')
    expect(requestedUrl).toContain('orderDirection=desc')
  })
})
