import { useState, type FormEvent } from 'react'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { EquipmentLifeSheet } from '../types/equipmentLifeSheet'
import { SuccessNotice } from '@/shared/ui/SuccessNotice'
import { AssignmentOperationForm } from './operations/AssignmentOperationForm'
import { AttachmentOperationForm } from './operations/AttachmentOperationForm'
import { FailureOperationForm } from './operations/FailureOperationForm'
import { MaintenanceOperationForm } from './operations/MaintenanceOperationForm'
import { ReturnOperationForm } from './operations/ReturnOperationForm'

type EquipmentOperationsPanelProps = {
  canAssign: boolean
  canCreateFailure: boolean
  canCreateMaintenance: boolean
  canReturn: boolean
  canUploadAttachment: boolean
  catalogs: EquipmentCatalogs | null
  lifeSheet: EquipmentLifeSheet | null
  onAssign: (userId: string, notes?: string) => Promise<void>
  onCreateFailure: (payload: { title: string; description: string; priority: string }) => Promise<void>
  onCreateMaintenance: (payload: {
    actionsTaken?: string
    cost?: number
    description?: string
    diagnosis?: string
    maintenanceType: 'preventive' | 'corrective'
    nextMaintenanceAt?: string
    performedBy?: string
    priority: string
  }) => Promise<void>
  onReturn: (notes?: string) => Promise<void>
  onUploadAttachment: (file: File) => Promise<void>
  status: 'idle' | 'loading' | 'ready' | 'error'
}

type SubmitState = 'idle' | 'submitting' | 'error' | 'success'

export function EquipmentOperationsPanel({
  canAssign,
  canCreateFailure,
  canCreateMaintenance,
  canReturn,
  canUploadAttachment,
  catalogs,
  lifeSheet,
  onAssign,
  onCreateFailure,
  onCreateMaintenance,
  onReturn,
  onUploadAttachment,
  status,
}: EquipmentOperationsPanelProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [assignUserId, setAssignUserId] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [returnNotes, setReturnNotes] = useState('')
  const [failureTitle, setFailureTitle] = useState('')
  const [failureDescription, setFailureDescription] = useState('')
  const [failurePriority, setFailurePriority] = useState('medium')
  const [maintenanceType, setMaintenanceType] = useState<'preventive' | 'corrective'>('preventive')
  const [maintenancePriority, setMaintenancePriority] = useState('medium')
  const [maintenanceTechnicianId, setMaintenanceTechnicianId] = useState('')
  const [maintenanceDescription, setMaintenanceDescription] = useState('')
  const [maintenanceDiagnosis, setMaintenanceDiagnosis] = useState('')
  const [maintenanceActions, setMaintenanceActions] = useState('')
  const [maintenanceCost, setMaintenanceCost] = useState('')
  const [nextMaintenanceAt, setNextMaintenanceAt] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)

  const disabled = status !== 'ready' || !lifeSheet
  const currentResponsible = lifeSheet?.equipment.currentResponsible?.name ?? 'Sin responsable'
  const hasOperations =
    canAssign || canCreateFailure || canCreateMaintenance || canReturn || canUploadAttachment

  async function submit(operation: () => Promise<void>) {
    setSubmitState('submitting')

    try {
      await operation()
      setSubmitState('success')
      window.setTimeout(() => setSubmitState('idle'), 1800)
    } catch {
      setSubmitState('error')
    }
  }

  function handleAssign(event: FormEvent) {
    event.preventDefault()

    if (!assignUserId) return

    submit(async () => {
      await onAssign(assignUserId, assignNotes || undefined)
      setAssignUserId('')
      setAssignNotes('')
    })
  }

  function handleReturn(event: FormEvent) {
    event.preventDefault()

    submit(async () => {
      await onReturn(returnNotes || undefined)
      setReturnNotes('')
    })
  }

  function handleFailure(event: FormEvent) {
    event.preventDefault()

    submit(async () => {
      await onCreateFailure({
        description: failureDescription,
        priority: failurePriority,
        title: failureTitle,
      })
      setFailureTitle('')
      setFailureDescription('')
      setFailurePriority('medium')
    })
  }

  function handleMaintenance(event: FormEvent) {
    event.preventDefault()

    submit(async () => {
      await onCreateMaintenance({
        actionsTaken: maintenanceActions || undefined,
        cost: maintenanceCost ? Number(maintenanceCost) : undefined,
        description: maintenanceDescription || undefined,
        diagnosis: maintenanceDiagnosis || undefined,
        maintenanceType,
        nextMaintenanceAt: nextMaintenanceAt || undefined,
        performedBy: maintenanceTechnicianId || undefined,
        priority: maintenancePriority,
      })
      setMaintenanceDescription('')
      setMaintenanceDiagnosis('')
      setMaintenanceActions('')
      setMaintenanceCost('')
      setNextMaintenanceAt('')
    })
  }

  function handleAttachment(event: FormEvent) {
    event.preventDefault()

    if (!attachment) return

    submit(async () => {
      await onUploadAttachment(attachment)
      setAttachment(null)
    })
  }

  if (!lifeSheet) {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        Las acciones se habilitan al seleccionar un equipo.
      </aside>
    )
  }

  return (
    <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Operaciones</p>
        <h2 className="mt-1 text-lg font-semibold text-white">{lifeSheet.equipment.internalCode}</h2>
        <p className="text-sm text-slate-400">Responsable actual: {currentResponsible}</p>
      </div>

      {submitState === 'error' && (
        <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          No fue posible completar la operacion.
        </p>
      )}
      {submitState === 'success' && (
        <SuccessNotice
          message="Operacion completada"
          subText="Los cambios se guardaron correctamente."
          onClose={() => setSubmitState('idle')}
        />
      )}

      {!hasOperations && (
        <p className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
          Tu rol tiene acceso de consulta para este equipo.
        </p>
      )}

      {canAssign && (
        <AssignmentOperationForm
          assignNotes={assignNotes}
          assignUserId={assignUserId}
          catalogs={catalogs}
          disabled={disabled}
          isSubmitting={submitState === 'submitting'}
          onAssignNotesChange={setAssignNotes}
          onAssignUserIdChange={setAssignUserId}
          onSubmit={handleAssign}
        />
      )}

      {canReturn && (
        <ReturnOperationForm
          disabled={disabled}
          isSubmitting={submitState === 'submitting'}
          returnNotes={returnNotes}
          onReturnNotesChange={setReturnNotes}
          onSubmit={handleReturn}
        />
      )}

      {canCreateFailure && (
        <FailureOperationForm
          disabled={disabled}
          failureDescription={failureDescription}
          failurePriority={failurePriority}
          failureTitle={failureTitle}
          isSubmitting={submitState === 'submitting'}
          onFailureDescriptionChange={setFailureDescription}
          onFailurePriorityChange={setFailurePriority}
          onFailureTitleChange={setFailureTitle}
          onSubmit={handleFailure}
        />
      )}

      {canCreateMaintenance && (
        <MaintenanceOperationForm
          catalogs={catalogs}
          disabled={disabled}
          isSubmitting={submitState === 'submitting'}
          maintenanceActions={maintenanceActions}
          maintenanceCost={maintenanceCost}
          maintenanceDescription={maintenanceDescription}
          maintenanceDiagnosis={maintenanceDiagnosis}
          maintenancePriority={maintenancePriority}
          maintenanceTechnicianId={maintenanceTechnicianId}
          maintenanceType={maintenanceType}
          nextMaintenanceAt={nextMaintenanceAt}
          onMaintenanceActionsChange={setMaintenanceActions}
          onMaintenanceCostChange={setMaintenanceCost}
          onMaintenanceDescriptionChange={setMaintenanceDescription}
          onMaintenanceDiagnosisChange={setMaintenanceDiagnosis}
          onMaintenancePriorityChange={setMaintenancePriority}
          onMaintenanceTechnicianIdChange={setMaintenanceTechnicianId}
          onMaintenanceTypeChange={setMaintenanceType}
          onNextMaintenanceAtChange={setNextMaintenanceAt}
          onSubmit={handleMaintenance}
        />
      )}

      {canUploadAttachment && (
        <AttachmentOperationForm
          attachment={attachment}
          disabled={disabled}
          isSubmitting={submitState === 'submitting'}
          onAttachmentChange={setAttachment}
          onSubmit={handleAttachment}
        />
      )}
    </aside>
  )
}
