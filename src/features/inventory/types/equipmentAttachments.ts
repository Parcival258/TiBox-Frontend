import type { Person } from '@/shared/types/person'

export type EquipmentAttachment = {
  id: string
  fileName: string
  mimeType: string | null
  sizeBytes: number | null
  uploader: Person
  createdAt: string
}
