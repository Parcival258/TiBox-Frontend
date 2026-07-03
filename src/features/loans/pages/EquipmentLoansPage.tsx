import { useState, type FormEvent } from 'react'
import type {
  CreateEquipmentLoanPayload,
  EquipmentLoan,
  LoanEquipment,
  RequestEquipmentLoanPayload,
  ReturnEquipmentLoanPayload,
} from '../types'
import type { EquipmentCatalogs } from '@/features/inventory/types/equipmentCatalogs'
import type { Equipment } from '@/features/inventory/types/equipmentCore'
import type { ModuleState } from '@/shared/types/ui'
import { LoanApprovalModal } from '../components/LoanApprovalModal'
import { LoanListPanel } from '../components/LoanListPanel'
import { LoanRejectionModal } from '../components/LoanRejectionModal'
import { LoanRequestPanel } from '../components/LoanRequestPanel'
import { LoanReturnModal } from '../components/LoanReturnModal'
import {
  createInitialLoanForm,
  createLoanPayload,
  createLoanRequestPayload,
  createReturnLoanPayload,
} from '../utils/loanFormState'

type EquipmentLoansPageProps = {
  canCreate: boolean
  canRequest: boolean
  canReturn: boolean
  catalogs: EquipmentCatalogs | null
  equipment: Equipment[]
  loans: EquipmentLoan[]
  requestableEquipment: LoanEquipment[]
  status: ModuleState
  onCreateLoan: (payload: CreateEquipmentLoanPayload) => Promise<void>
  onRequestLoan: (payload: RequestEquipmentLoanPayload) => Promise<void>
  onApproveLoan: (loanId: string, equipmentId: string) => Promise<void>
  onRejectLoan: (loanId: string, reason: string) => Promise<void>
  onReturnLoan: (loanId: string, payload: ReturnEquipmentLoanPayload) => Promise<void>
}

export function EquipmentLoansPage({
  canCreate,
  canRequest,
  canReturn,
  catalogs,
  equipment,
  loans,
  requestableEquipment,
  status,
  onCreateLoan,
  onRequestLoan,
  onApproveLoan,
  onRejectLoan,
  onReturnLoan,
}: EquipmentLoansPageProps) {
  const [form, setForm] = useState(createInitialLoanForm)
  const [returningLoan, setReturningLoan] = useState<EquipmentLoan | null>(null)
  const [approvingLoan, setApprovingLoan] = useState<EquipmentLoan | null>(null)
  const [approvalEquipmentId, setApprovalEquipmentId] = useState('')
  const [rejectingLoan, setRejectingLoan] = useState<EquipmentLoan | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [returnNotes, setReturnNotes] = useState('')
  const [receivedSignatureImage, setReceivedSignatureImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setHasError(false)

    try {
      await onCreateLoan(createLoanPayload(form))
      setForm(createInitialLoanForm())
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReturn(event: FormEvent) {
    event.preventDefault()

    if (!returningLoan) return

    setIsSubmitting(true)
    setHasError(false)

    try {
      await onReturnLoan(returningLoan.id, createReturnLoanPayload(returnNotes, receivedSignatureImage))
      setReturningLoan(null)
      setReturnNotes('')
      setReceivedSignatureImage('')
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRequest(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setHasError(false)

    try {
      await onRequestLoan(createLoanRequestPayload(form))
      setForm((current) => ({
        ...current,
        estimatedReturnAt: '',
        notes: '',
        requestedItem: '',
      }))
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleApprove(event: FormEvent) {
    event.preventDefault()
    if (!approvingLoan || !approvalEquipmentId) return

    setIsSubmitting(true)
    setHasError(false)
    try {
      await onApproveLoan(approvingLoan.id, approvalEquipmentId)
      setApprovingLoan(null)
      setApprovalEquipmentId('')
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReject(event: FormEvent) {
    event.preventDefault()
    if (!rejectingLoan) return

    setIsSubmitting(true)
    setHasError(false)
    try {
      await onRejectLoan(rejectingLoan.id, rejectionReason)
      setRejectingLoan(null)
      setRejectionReason('')
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid min-w-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <LoanListPanel
        canCreate={canCreate}
        canReturn={canReturn}
        isSubmitting={isSubmitting}
        loans={loans}
        status={status}
        onApprove={setApprovingLoan}
        onReject={setRejectingLoan}
        onReturn={setReturningLoan}
      />

      <LoanRequestPanel
        canCreate={canCreate}
        canRequest={canRequest}
        catalogs={catalogs}
        equipment={equipment}
        form={form}
        hasError={hasError}
        isSubmitting={isSubmitting}
        setForm={setForm}
        onCreate={handleCreate}
        onRequest={handleRequest}
      />

      {returningLoan && (
        <LoanReturnModal
          isSubmitting={isSubmitting}
          loan={returningLoan}
          receivedSignatureImage={receivedSignatureImage}
          returnNotes={returnNotes}
          onClose={() => setReturningLoan(null)}
          onReceivedSignatureImageChange={setReceivedSignatureImage}
          onReturnNotesChange={setReturnNotes}
          onSubmit={handleReturn}
        />
      )}

      {approvingLoan && (
        <LoanApprovalModal
          approvalEquipmentId={approvalEquipmentId}
          isSubmitting={isSubmitting}
          loan={approvingLoan}
          requestableEquipment={requestableEquipment}
          onApprovalEquipmentChange={setApprovalEquipmentId}
          onCancel={() => {
            setApprovingLoan(null)
            setApprovalEquipmentId('')
          }}
          onSubmit={handleApprove}
        />
      )}

      {rejectingLoan && (
        <LoanRejectionModal
          isSubmitting={isSubmitting}
          loan={rejectingLoan}
          rejectionReason={rejectionReason}
          onCancel={() => setRejectingLoan(null)}
          onRejectionReasonChange={setRejectionReason}
          onSubmit={handleReject}
        />
      )}
    </section>
  )
}
