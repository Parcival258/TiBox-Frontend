import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assignEquipment,
  createEquipment,
  createEquipmentType,
  createFailureReport,
  createMaintenanceRecord,
  deleteEquipmentAttachment,
  getEquipment,
  getEquipmentLifeSheet,
  uploadEquipmentAttachment,
} from './equipmentService'

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

  it('keeps resource endpoints grouped behind the public barrel', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await createEquipment({ internalCode: 'EQ-1', serial: 'SER-1', type: 'Portatil' })
    await getEquipmentLifeSheet('equipment-1')
    await createEquipmentType({ name: 'Portatil' })
    await assignEquipment('equipment-1', 'user-1', 'Entrega inicial')
    await createFailureReport({ equipmentId: 'equipment-1', title: 'Falla', description: 'No enciende' })
    await createMaintenanceRecord({
      equipmentId: 'equipment-1',
      maintenanceType: 'corrective',
    })
    await uploadEquipmentAttachment('equipment-1', new File(['x'], 'file.txt'))
    await deleteEquipmentAttachment('equipment-1', 'attachment-1')

    const requestedUrls = fetchMock.mock.calls.map((call) => call[0])
    expect(requestedUrls).toEqual([
      'http://localhost:3333/api/v1/equipment',
      'http://localhost:3333/api/v1/equipment/equipment-1/life-sheet',
      'http://localhost:3333/api/v1/equipment-types',
      'http://localhost:3333/api/v1/equipment/equipment-1/assignments',
      'http://localhost:3333/api/v1/failure-reports',
      'http://localhost:3333/api/v1/maintenance/records',
      'http://localhost:3333/api/v1/equipment/equipment-1/attachments',
      'http://localhost:3333/api/v1/equipment/equipment-1/attachments/attachment-1',
    ])
  })
})
