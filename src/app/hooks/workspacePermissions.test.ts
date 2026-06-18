import { describe, expect, it } from 'vitest'
import type { User } from '@/features/users/types'
import { buildWorkspacePermissions } from './workspacePermissions'

const admin: User = {
  id: 'user-1',
  email: 'admin@example.com',
  name: 'Admin',
  permissions: [
    'alerts.manage',
    'alerts.view',
    'equipment.create',
    'equipment.update',
    'equipment.view',
    'settings.headquarters.view',
    'users.update',
  ],
  role: { id: 'role-1', name: 'Admin', slug: 'admin' },
}

describe('buildWorkspacePermissions', () => {
  it('denies protected actions without a user', () => {
    const permissions = buildWorkspacePermissions(null)

    expect(permissions.canViewAlerts).toBe(false)
    expect(permissions.canManageUsers).toBe(false)
    expect(permissions.canViewSettings).toBe(false)
  })

  it('combines role and permissions for administration capabilities', () => {
    const permissions = buildWorkspacePermissions(admin)

    expect(permissions.canManageUsers).toBe(true)
    expect(permissions.canManageEquipmentTypes).toBe(true)
    expect(permissions.canViewSettings).toBe(true)
  })
})
