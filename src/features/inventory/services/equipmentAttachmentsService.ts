import { buildUrl, deleteJson, postForm } from '@/shared/services/api'
import type { EquipmentAttachment } from '../types/equipmentAttachments'

export function uploadEquipmentAttachment(equipmentId: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return postForm<EquipmentAttachment>(`/api/v1/equipment/${equipmentId}/attachments`, body)
}

export function deleteEquipmentAttachment(equipmentId: string, attachmentId: string) {
  return deleteJson(`/api/v1/equipment/${equipmentId}/attachments/${attachmentId}`)
}

export function equipmentAttachmentDownloadUrl(equipmentId: string, attachmentId: string) {
  return buildUrl(`/api/v1/equipment/${equipmentId}/attachments/${attachmentId}`)
}
