import type { User } from '@/shared/types/inventory'
import { can } from '@/shared/utils/permissions'

export function buildWorkspacePermissions(user: User | null) {
  return {
    canAssignEquipment: can(user, 'equipment.assign'),
    canCloseMaintenance: can(user, 'maintenance.close'),
    canCreateEquipment: can(user, 'equipment.create'),
    canCreateFailureReports: can(user, 'failure_reports.create'),
    canCreateMaintenance: can(user, 'maintenance.create'),
    canDeleteEquipment: can(user, 'equipment.delete'),
    canManageAlerts: can(user, 'alerts.manage'),
    canManageEquipmentAttachments: can(user, 'equipment.attachments.manage'),
    canManageFailureReports: can(user, 'failure_reports.manage'),
    canViewFailureReports: can(user, 'failure_reports.view'),
    canReturnEquipment: can(user, 'equipment.return'),
    canUpdateEquipment: can(user, 'equipment.update'),
    canViewEquipmentLoans: can(user, 'equipment.view'),
    canUpdateMaintenance: can(user, 'maintenance.update'),
    canViewAlerts: can(user, 'alerts.view'),
    canViewMaintenance: can(user, 'maintenance.view'),
    canManageHeadquarters: can(user, 'settings.headquarters.manage'),
    canManageLocations: can(user, 'settings.locations.manage'),
    canManageEquipmentTypes: can(user, 'equipment.create') && can(user, 'equipment.update'),
    canManageUsers: user?.role?.slug === 'admin' && can(user, 'users.update'),
    canViewSettings:
      can(user, 'settings.headquarters.view') ||
      can(user, 'settings.locations.view') ||
      can(user, 'equipment.view'),
  }
}
